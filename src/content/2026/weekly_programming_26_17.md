# Weekly Programming 26-17

## Hook 系统

Hook 让系统围绕主循环生长, 而不是不断重新主循环本身

> 不改主循环代码, 也能在关键时机插入额外行为

### 主要解决了什么问题

很多真实需要不属于 "允许 / 拒绝" 这条线, 而是:

- 在某个固定时机顺手做一点事
- 不改主循环主体, 也能接入额外规则
- 让用户或插件在系统边缘扩展能力

如果每增加一个需求, 都去修改主循环, 主循环就会越来越重

所以将要引入的机制是: **主循环只负责暴露 "时机", 真正的附加行为交给 hook**

### 什么是 hook

可以把 hook 理解为一个 "预留插口"

1. 主系统运行到某个固定时机
2. 把当前上下文交给 hook
3. hook 返回结果
4. 主系统再决定下一步怎么继续

最重要的一句话是: **hook 让系统可扩展, 但不要求主循环理解每个扩展需求**

主循环只需要知道三件事:

- 现在是什么事件
- 要把哪些上下文交出去
- 收到结果以后怎么处理

### 最小心智模型

`SessionStart`, `PreToolUse`, `PostToolUse`

先理解这 3 个事件, 然后做出一套可用的 hook 机制

可以把它想象为以下流程:

```text
主循环继续往前跑
  |
  +-- 到了某个预留时机
  |
  +-- 调用 hook runner
  |
  +-- 收到 hook 返回结果
  |
  +-- 决定继续、阻止、还是补充说明
```

### 返回约定

建议先统一为下面的规则:

| 退出码 | 含义                     |
| :----- | :----------------------- |
| `0`    | 正常继续                 |
| `1`    | 阻止当前动作             |
| `2`    | 注入一条补充信息, 再继续 |

这套规则不在于真实, 而在于最容易学会

它代表 hook 最核心的 3 种作用:

- 观察
- 拦截
- 补充

### 关键数据结构

#### 1. HookEvent

```python
event = {
    "name": "PreToolUse",
    "payload": {
        "tool_name": "bash",
        "input": {"command": "pytest"},
    },
}
```

它回答的是: 现在发生了什么事件? 这个事件的上下文是什么?

#### 2. HookResult

```python
result = {
    "exit_code": 0,
    "message": "",
}
```

它回答的是: hook 想不想阻止主流程? 要不要向模型补一条说明?

#### 3. HookRunner

```python
class HookRunner:
    def run(self, event_name: str, payload: dict) -> dict:
        ...
```

主循环不直接关心 "每个 hook 的细节实现"

它只把事件交给统一的 runner: **主循环不知道事件名, hook runner 知道怎么调用扩展逻辑**

### 最小执行流程

先看最重要的 `PreToolUse` / `PostToolUse`

```text
model 发起 tool_use
    |
    v
run_hook("PreToolUse", ...)
    |
    +-- exit 1 -> 阻止工具执行
    +-- exit 2 -> 先补一条消息给模型，再继续
    +-- exit 0 -> 直接继续
    |
    v
执行工具
    |
    v
run_hook("PostToolUse", ...)
    |
    +-- exit 2 -> 追加补充说明
    +-- exit 0 -> 正常结束
```

再加上 `SessionStart`, 一整套最小 hook 机制就建立了

### 最小实现

#### 第一步: 准备一个事件到处理器的映射

```python
HOOKS = {
    "SessionStart": [on_session_start],
    "PreToolUse": [pre_tool_guard],
    "PostToolUse": [post_tool_log],
}
```

一个事件对应一组主力函数

#### 第二步: 统一运行 hook

```python
def run_hooks(event_name: str, payload: dict) -> dict:
    for handler in HOOKS.get(event_name, []):
        result = handler(payload)
        if result["exit_code"] in (1, 2):
            return result
    return {"exit_code": 0, "message": ""}
```

谁先返回阻止 / 注入, 谁就优先

#### 第三步: 接进主循环

```python
pre = run_hooks("PreToolUse", {
    "tool_name": block.name,
    "input": block.input,
})

if pre["exit_code"] == 1:
    results.append(blocked_tool_result(pre["message"]))
    continue

if pre["exit_code"] == 2:
    messages.append({"role": "user", "content": pre["message"]})

output = run_tool(...)

post = run_hooks("PostToolUse", {
    "tool_name": block.name,
    "input": block.input,
    "output": output,
})
```

最关键的不是代码量, 而是心智: **hook 不是主循环的替代品, 而是主循环在固定时机对外发出的调用**
