# Weekly Programming 26-16

## 权限系统

> 模型产生的执行意图, 必须先通过清晰的权限门, 在变成真正动作

到目前为止, agent 已经能读写文件, 执行命令, 做规划, 压缩上下文

但问题也随之出现

* 模型可能会写错文件
* 模型可能会执行危险的命令
* 模型可能会在不该动手的时候动手

所以从现在开始, 系统需要一条新的管道: **"意图"不能直接变成"执行", 中间必须经过权限检查**

### 名词解释

#### 什么是权限系统

不是 "有没有权限" 这样一个布尔值, 更像使用一条管道用来回答:

* 这次调用要不要直接拒绝
* 能不能自动执行
* 剩下的要不要询问用户

#### 什么是权限模式

权限模式是系统当前的总体风格, 例如:

* 谨慎一点: 大多数操作都问用户
* 保守一点: 只允许读, 不允许写
* 流畅一点: 简单安全的操作自动放行

#### 什么是规则

规则就是 "遇到某种工具调用时, 该怎么处理"的小条款

最小规则包含三部分:

```json
{
    "tool": "bash",
    "content": "sudo *",
    "behavior": "deny"
}
```

意思是针对 `bash`, 如果命令内容匹配 `sudo *`, 就拒绝

### 最小权限系统

如果从 0 开始手写, 一个最小但正确的权限系统只需要四步:

```text
tool_call
  |
  v
1. deny rules     -> 命中了就拒绝
  |
  v
2. mode check     -> 根据当前模式决定
  |
  v
3. allow rules    -> 命中了就放行
  |
  v
4. ask user       -> 剩下的交给用户确认
```

### 为什么顺序是这样

1. 先看 deny rules: 有些东西不应该交给 "模式" 去决定, 比如危险的命令, 越界的路径, 这些应该优先挡掉
2. 看 mode: mode 决定当前会话的大方向, 例如在 `plan` 模式下, 系统就应该天然更保守
3. 看 allow rules: 有些安全, 重复, 常见的操作可以直接过, 例如读文件, 搜索代码
4. ask: 前面都没命中, 才会交给用户

### 推荐先实现的 3 种模式

|模式|会话|适合什么场景|
|:---|:---|:---|
|`default`|未命中规则时问用户|日常交互|
|`plan`|只允许读, 不允许写|计划, 审查, 分析|
|`auto`|简单安全操作自动过, 危险操作再问|高流畅度探索|

### 最小实现

```python
def check_permission(tool_name: str, tool_input: dict) -> dict:
    # 1. deny rules
    for rule in deny_rules:
        if matches(rule, tool_name, tool_input):
            return {"behavior": "deny", "reason": "matched deny rule"}

    # 2. mode
    if mode == "plan" and tool_name in WRITE_TOOLS:
        return {"behavior": "deny", "reason": "plan mode blocks writes"}
    if mode == "auto" and tool_name in READ_ONLY_TOOLS:
        return {"behavior": "allow", "reason": "auto mode allows reads"}

    # 3. allow rules
    for rule in allow_rules:
        if matches(rule, tool_name, tool_input):
            return {"behavior": "allow", "reason": "matched allow rule"}

    # 4. fallback
    return {"behavior": "ask", "reason": "needs confirmation"}
```

然后在执行工具前接进去

```python
decision = perms.check(tool_name, tool_input)

if decision["behavior"] == "deny":
    return f"Permission denied: {decision['reason']}"
if decision["behavior"] == "ask":
    ok = ask_user(...)
    if not ok:
        return "Permission denied by user"

return handler(**tool_input)
```

---

权限系统不是为了让 agent 更笨, 而是为了让 agent 的行动先经过一道可靠的安全判断

---
