# Weekly Programming 26-21

## 系统提示词

> 系统提示词不是一整块大字符串, 而是一条可维护的组装流水线

### 名词解释

#### system prompt

system prompt 是给模型的系统级说明, 它通常告诉模型:

* 你是谁
* 你能做什么
* 你应该遵守什么样的规则
* 你现在处在什么环境

#### 组装流水线

不同的信息来自不同的地方, 最后按照顺序拼接成一份输入

不是一个死字符串, 而是一条构建过程

#### 动态信息

有些信息经常变化, 例如当前日期, 当前工作目录, 本轮新增的提醒等, 这些信息不适合和所有稳定说明混在一起

### 最小模型

最容易理解的方式, 是把 system prompt 想成 6 段:

```text
1. 核心身份和行为说明
2. 工具列表
3. skills 元信息
4. memory 内容
5. AGENT.md 指令链
6. 动态环境信息
```

然后按顺序拼接:

```text
core
+ tools
+ skills
+ memory
+ agent_md
+ dynamic_context
= final system prompt
```

### 为什么不把所有东西都硬塞进一个大字符串

#### 不好维护

很难知道哪一条来自哪里, 该修改哪一部分, 哪一段是固定说明哪一段是临时上下文

#### 不好测试

如果 system prompt 是一大坨文本, 很难分别测试

工具说明生成得对不对

memory 是否被正确拼进去

AGENT.md 是否被正确读取

#### 不好做缓存和动态更新

一些稳定内容其实不用担心每轮大变, 一些临时内容又应该只或一轮, 这就需要将 "稳定块" 和 "动态块" 分开思考

### 最小实现结构

#### 第一步: 做一个 builder

```python
class SystemPromptBuilder:
    def build(self) -> str:
        parts = []
        parts.append(self._build_core())
        parts.append(self._build_tools())
        parts.append(self._build_skills())
        parts.append(self._build_memory())
        parts.append(self._build_claude_md())
        parts.append(self._build_dynamic())
        return "\n\n".join(p for p in parts if p)
```

这是最核心的设计

#### 第二步: 每一段只负责一种来源

例如:

* `_build_tools()` 只负责把工具说明生成出来
* `_build_memory()` 只负责拿 memory
* `_build_claude_md()` 只负责读指令文件

### 最关键的结构化边界

#### 1. 稳定说明 vs 动态提醒

稳定的系统说明, 每轮临时变化的提醒, 这两类东西不应该混为一谈

#### 2. system prompt vs system reminder

system prompt 适合放身份, 规则, 工具, 长期约束

system reminder 适合放这一轮才临时需要的补充上下文, 当前变动的状态

所以更清晰的做法是, 主 system prompt 保持相对稳定, 每轮额外变换的内容, 用单独的 reminder 方式增加

### 一个实用的版本

```text
静态部分
- core
- tools
- skills
- memory
- agent_md

动态部分
- date
- cwd
- model
- current mode
```

如果要更清楚一点, 还可以加一个边界标记

```text
=== DYNAMIC_BOUNDARY ===
```

它只是提醒: **上面更稳定, 下面更容易变动**

### AGENT.md 为什么要单独一段

它的橘色不是 "某一次任务的临时上下文", 而是更稳定的长期说明, 最容易理解的链条是:

1. 用户全局级
2. 项目根目录级
3. 当前子目录级

然后全部拼进去, 而不是互相覆盖, **"规则来源可以分层叠加"**

### memory 为什么要和 system prompt 有关心

memory 的本质是: **把跨会话仍然有价值的信息, 重新带回模型当前的工作环境**

如果保存了 memory, 却从来不在系统输入中重新呈现, 那就没有真正使用 memory, 所以 memory 最终一定要进入 system prompt 组装链条

---
> system prompt 的关键不是 "写一段很长的话, 而是把来源不同的信息块按清晰边界组装起来"
---
