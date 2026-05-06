# Weekly Programming 26-18

## 记忆系统

只保存跨会话还成立的东西

> 只有跨会话, 无法从当前工作重新推导的知识, 才值得进入 memory
>
> 不是所有信息都该进入 memory, 只有跨会话仍然有价值的东西, 才值得留下

### 解决了什么问题?

如果一个 agent 每次新会话都完全从 0 开始, 它就会不断重复忘记这些事情:

- 用户长期偏好
- 用户多次纠正过的错误
- 某些不容易从代码直接看出来的项目约定
- 某些外部资源在哪里找

这会让系统显得 "每次都像第一次合作"

所以需要 memory

### 先立一个边界: memory 不是什么都存

memory 不是 "把一切有用的信息都记下来"

如果这样做, memory会变成垃圾堆, 越存越乱; agent 也会开始依赖过时记忆, 而不是读取当前真实状态

所以必须先立一个原则: 只有那些跨会话仍有价值, 而且不能轻易从当前仓库状态直接推出来的信息, 才适合进入 memory

### 名词解释

#### 什么是跨会话

- 当前对话结束了
- 下次重新开始一个新会话
- 这条消息仍然可能有用

#### 什么是 "不可轻易重新推导"

- 用户明显说 "讨厌这种写法"
- 某个架构决定背后的真实原因是合规要求
- 某个团队总在某个外部看板里跟踪问题

这些东西, 往往不是重新扫一遍代码就能立刻知道的

### 最适合先做的 4 类 memory

#### user

用户偏好, 例如:

- 喜欢什么代码风格
- 回答希望简洁还是详细
- 更偏好什么工具链

#### feedback

用户明确纠正过的地方, 例如:

- "不要这样更改"
- "这个判断方式之前错过"
- "以后遇到同样的情况要先做..."

#### project

这里只保存 **不容易从代码直接重新看出来** 的项目约定或背景, 例如:

- 某个设计决定是因为合规而不是技术偏好
- 某个目录虽然看起来很旧, 但是短期内不能动
- 某条规则是团队故意定下来的, 不是历史残留

#### reference

外部资源指针, 例如:

- 某个问题在哪个看板里
- 某个监控面板在哪里
- 某个资料库在哪个 url

### 最小心智模型

```text
conversation
   |
   | 用户提到一个长期重要信息
   v
save_memory
   |
   v
.memory/
  ├── MEMORY.md        # 索引
  ├── prefer_tabs.md
  ├── feedback_tests.md
  └── incident_board.md
   |
   v
下次新会话开始时重新加载
```

### 关键数据结构

#### 1. 单条 memory 文件

最简单也是最清晰的做饭, 是每条 memory 一个文件

```md
---
name: prefer_tabs
description: User prefers tabs for indentation
type: user
---

The user explicitly prefers tabs over spaces when editing source files.
```

这里的 `frontmatter` 可以理解为:

**放在正文前面的结构化元数据**, 描述了这条 memory 的类型、名称和描述

#### 2. 索引文件

```md
# Memory Index

- prefer_tabs: User prefers tabs for indentation [user]
- avoid_mock_heavy_tests: User dislikes mock-heavy tests [feedback]
```

索引的作用不是重复保存全部内容, 只是帮系统快速知道 "有哪些 memory 可用"

### 最小实现步骤

#### 第一步: 定义 memory 类型

```python
MEMORY_TYPES = ("user", "feedback", "project", "reference")
```

#### 第二步: 写一个 `save_memory` 工具

最小参数就 4 个:

- `name`
- `description`
- `type`
- `content`

#### 第三步: 每条 memory 独立落盘

```python
def save_memory(name, description, mem_type, content):
    path = memory_dir / f"{safe_name}.md"
    path.write_text(frontmatter + content)
    rebuild_index()
```

#### 第四步: 会话开始时重新加载

把 memory 文件重新读出来, 拼成一段 memory section

#### 第五步: 把 memory section 接进系统输入

### memory, task, plan, CLAUDE.md 的边界

- memory: 保存跨会话仍有价值的信息
- task: 保存当前工作要做什么, 依赖关系如何, 进度如何
- plan: 保护 "这一轮我要怎么做" 的过程性安排
- CLAUDE.md: 保存更稳定, 更像长期规则的说明文本

一个简单判断法:

- 只对这次任务有用: `task` / `plan`
- 以后很多会话可能还有用: `memory`
- 属于长期系统级或项目固定说明: `CLAUDE.md`

### 还需要补充的 6 条边界

#### 不是所有 memory 都该放在同一个作用域

更完整的系统里, 至少还要分清:

- `private`: 只属于当前用户或当前 agent 的记忆
- `team`: 整个项目团队都该共享的记忆

一个很稳的判断方法是:

- `user` 类型几乎总是 `private`
- `feedback` 类型, 默认 `private`, 只有它明确是团队规则时才升到 `team`
- `project` 和 `reference` 通常更偏向 `team`

这样做的价值是:

- 不把个人偏好误写为团队规范
- 不把团队规范只锁在某一个人的私有记忆里

#### 不只保存 "你做错了", 也要保存 "这样做是对的"

只想到纠错, 还不够, 因为真正能长期使用的系统, 还需要记住:

- 哪种不明显的做法, 用户已经明确认可
- 哪个判断方式, 项目里已经被验证有效

也就是说, `feedback` 不只来自负反馈, 也来自被验证的正反馈

如果只存纠错, 不存被确认有效的做法, 那系统会越来越保守, 却不一定越来越聪明

#### 有些东西即使用户要求你存, 也不能直接存

有些内容: 太容易过时, 更适合存在代码/任务板/git记录, 会把 memory 变成活动日志

更好的做法是追问依据: 这里面真正值得长期留下的, 非显然的信息到底是什么?

#### memory 会漂移, 所以回答前要先核对当前状态

memory 记录的是 "曾经成立过的事实", 不是永久真理

所以更稳的工作方式是:

1. 先把 memory 当作方向提示
2. 再去读当前文件, 当前资源, 当前配置
3. 如果冲突, 有限相信刚观察到的真实状态

agent 最容易把 memory 当成 "已经查证过的答案"

#### 用户说 "忽略 memory" 时, 就当它是空的

这是一个很容易漏讲的边界, 如果用户明确说: "这次不参考 memory", "忽略之前的记忆"

那系统更合理的处理不是一边继续用 memory, 一边说 "我已忽略"

而是 **在这一轮里, 直接按 memory 为空** 来工作

#### 推荐具体路径, 函数, 外部资源前, 要再验证一次

memory 很适合保存:

- 哪个看板通常有上下文
- 哪个目录以前是关键入口
- 某种项目约定为什么存在

但有时命名, 路径, 系统入口, 外部链接等都是会变的

更稳妥的方法是: memory 先告诉去哪里验证, 验证完, 再给用户结论
