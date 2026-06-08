# Weekly Programming 26-24

## 错误恢复

> 错误不是例外, 而是主循环必须预留出来的一条正常分支

### 名词解释

#### 恢复

恢复不是把所有错误都藏起来, 恢复的意思是:

* 先判断这是不是临时问题
* 如果是, 就尝试一个有限次数的补救动作
* 如果补救失败, 再把失败明确告诉用户

#### 重试预算

重试预算, 就是 "最多试几次"

如果没有这个预算, 程序就可能无限循环

#### 状态机

> 一个东西会在几个明确状态之间按规则切换

在这里, 主循环从 "普通执行" 变成了:

* 正常执行
* 续写恢复
* 压缩恢复
* 退避重试
* 最终失败

### 最小模型

错误恢复很简单, 首先区分三类问题

```text
1. 输出被截断: 模型还没说完, 但 token 用完了
2. 上下文太长: 请求装不进模型窗口了
3. 临时连接失败: 网络, 超时, 限流, 服务抖动
```

对应三条恢复路径:

```text
LLM call
  |
  +-- stop_reason == "max_tokens"
  |      -> 注入续写提示
  |      -> 再试一次
  |
  +-- prompt too long
  |      -> 压缩旧上下文
  |      -> 再试一次
  |
  +-- timeout / rate limit / transient API error
         -> 等一会儿
         -> 再试一次
```

这就是最小但正确的恢复模型

### 关键数据结构

#### 恢复状态

```python
recovery_state = {
    "continuation_attempts": 0,
    "compact_attempts": 0,
    "transport_attempts": 0,
}
```

它的作用不是 "记录一切", 而是防止无限重试, 让每种恢复路径各算各的次数

#### 恢复决策

```python
{
    "kind": "continue" | "compact" | "backoff" | "fail",
    "reason": "why this branch was chosen",
}
```

把 "错误长什么样" 和 "接下来怎么做" 分开, 会更清楚

#### 续写提示

```python
CONTINUE_MESSAGE = (
    "Output limit hit. Continue directly from where you stopped. "
    "Do not restart or repeat."
)
```

这条提示非常重要, 因为如果只对模型说 "继续", 模型经常会重新总结, 重新开头, 重复已经输出过的内容

### 最小实现

先写一个恢复选择器

```python
def choose_recovery(stop_reason: str | None, error_text: str | None) -> dict:
    if stop_reason == "max_tokens":
        return {"kind": "continue", "reason": "output truncated"}

    if error_text and "prompt" in error_text and "long" in error_text:
        return {"kind": "compact", "reason": "context too large"}

    if error_text and any(word in error_text for word in [
        "timeout", "rate", "unavailable", "connection"
    ]):
        return {"kind": "backoff", "reason": "transient transport failure"}

    return {"kind": "fail", "reason": "unknown or non-recoverable error"}
```

再把它接进主循环

```python
while True:
    try:
        response = client.messages.create(...)
        decision = choose_recovery(response.stop_reason, None)
    except Exception as e:
        response = None
        decision = choose_recovery(None, str(e).lower())

    if decision["kind"] == "continue":
        messages.append({"role": "user", "content": CONTINUE_MESSAGE})
        continue

    if decision["kind"] == "compact":
        messages = auto_compact(messages)
        continue

    if decision["kind"] == "backoff":
        time.sleep(backoff_delay(...))
        continue

    if decision["kind"] == "fail":
        break

    # 正常工具处理
```

这里的重点是: 先分类, 再选动作, 每条动作有自己的预算

### 三条恢复路径

#### 1. 输出被截断时, 做续写

这个问题的本质不是 "模型不会", 而是 "这一轮输出空间不够"

所以最小补法是:

1. 追加一条续写消息
2. 告诉模型不要重来, 不要重复
3. 让主循环继续

```python
if response.stop_reason == "max_tokens":
    if state["continuation_attempts"] >= 3:
        return "Error: output recovery exhausted"
    state["continuation_attempts"] += 1
    messages.append({"role": "user", "content": CONTINUE_MESSAGE})
    continue

```

#### 2. 上下文太长时, 先压缩再重试

这里的压缩, 是指把就对话从原文, 变成一份仍然可以继续工作的摘要

最小压缩结果建议至少保留:

* 当前任务是什么
* 已经做了什么
* 关键决定是什么
* 下一步准备做什么

```python
def auto_compact(messages: list) -> list:
    summary = summarize_messages(messages)
    return [{
        "role": "user",
        "content": "This session was compacted. Continue from this summary:\n" + summary,
    }]
```

#### 3. 连接抖动时, 退避重试

"退避" 这个词的意思是: 别立刻再打一次, 而是等一小会再试

这类错误往往时临时拥堵, 超时, 限流, 服务器抖动, 如果瞬间连续重试, 只会更容易失败

```python
def backoff_delay(attempt: int) -> float:
    return min(1.0 * (2 ** attempt), 30.0) + random.uniform(0, 1)
```

### 如何连接到主循环

最干净的方式, 是把恢复逻辑放在两个位置:

#### 1. 模型调用外层

负责处理: API 报错, 网络错误, 超时

#### 2. 拿到 response 之后

负责处理: `stop_reason == "max_tokens"`, 正常的 `tool_use`, 正常的结束

也就是说, 主循环现在不只是 "调模型 -> 执行工具", 而是

```text
1. 调模型
2. 如果调用报错，判断是否可以恢复
3. 如果拿到响应，判断是否被截断
4. 如果需要恢复，就修改 messages 或等待
5. 如果不需要恢复，再进入正常工具分支
```

### 需要注意的点

#### 把所有错误都当成一种错误

这会导致:

* 该续写的进行了压缩
* 该等待的进行重试
* 该失败的却无限拖延

#### 没有重试预算

没有预算, 主循环就可能永远卡在 "继续", "继续", "继续"...

#### 续写提示写得太模糊

只写一个 "continue" 是不够的, 需要明确告诉模型不要重复, 不要重新总结, 直接从中断点接着写

#### 压缩后没有告诉模型 "这是续场"

如果压缩后只给一份摘要, 不告诉模型这是 "前文摘要", 模型可能重新向用户提问

#### 恢复过程完全没有日志

最好打印类似 `[Recovery] continue`, `[Recovery] compact`, `[Recovery] backoff`, 这样能更清楚地看到主循环到底做了什么
