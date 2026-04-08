# Weekly Programming 26-15

## 上下文压缩

> 上下文不是越多越好, 而是要把 "仍然有用的部分" 留在活跃的工作里面

如果没有压缩机制, 很快会出现问题

1. 模型注意力被旧结果淹没
2. API 请求越来越重, 越来越贵
3. 最终直接撞上上下文上限, 任务中断

一些名词解释

* 上下文窗口: 模型这一轮真正能一起看到的输入容量
* 活跃上下文: 当前这几轮继续工作时, 最值得模型马上看到的那一部分
* 压缩: 用更短的表示方式, 保留继续工作真正需要的信息

### 最小心智模型

```text
第 1 层：大结果不直接塞进上下文
  -> 写到磁盘，只留预览

第 2 层：旧结果不一直原样保留
  -> 替换成简短占位

第 3 层：整体历史太长时
  -> 生成一份连续性摘要
```

也可以这样表示

```text
tool output
   |
   +-- 太大 -----------------> 保存到磁盘 + 留预览
   |
   v
messages
   |
   +-- 太旧 -----------------> 替换成占位提示
   |
   v
if whole context still too large:
   |
   v
compact history -> summary
```

手动触发 `/compact` 或 `compact` 工具, 其实就是走第三层

### 关键数据结构

1. Persisted Output Marker

    当工具输出太大时, 不把全文强塞进当前对话, 最小标记可以这样

    ```text
    <persisted-output>

    Full output saved to: .task_outputs/tool-results/abc123.txt
    Preview:
    ...
    </persisted-output>
    ```

    这个结构表达的是: 全文没有丢, 只是搬去了磁盘, 当前上下文只保留一个足够让模型继续判断的预览

2. CompactState

    可以显示维护一份压缩状态

    ```text
    {
        "has_compacted": False,
        "last_summary": "",
        "recent_files": [],
    }
    ```

    这些字段分别表示:

    * `has_compacted`: 这一轮之前是否已经做过完整压缩
    * `last_summary`: 最近一次压缩得到的摘要
    * `recent_file`: 最近碰过哪些文件, 压缩后方便追踪

3. Micro-Compact Boundary

    ```text
    只保留最近 3 个工具结果的完整内容

    更旧的改成占位提示
    ```

### 最小实现

1. 大工具结果先写磁盘

    ```python
    def persist_large_output(tool_use_id: str, output: str) -> str:
        if len(output) <= PERSIST_THRESHOLD:
            return output

        stored_path = save_to_disk(tool_use_id, output)
        preview = output[:2000]
        return (
            "<persisted-output>\n"
            f"Full output saved to: {stored_path}\n"
            f"Preview:\n{preview}\n"
            "</persisted-output>"
        )
    ```

    这一步的关键是让模型知道发生了什么, 但不强迫它一致背着整份原始大输出

2. 旧工具结果做微压缩

    ```python
    def micro_compact(messages: list) -> list:
        tool_results = collect_tool_results(messages)
        for result in tool_results[:-3]:
            result["content"] = "[Earlier tool result omitted for brevity]"
        return messages
    ```

    这一步是为了防止上下文被旧结果持续霸占

3. 整体历史过长时, 做一次完整压缩

    ```python
    def compact_history(messages: list) -> list:
        summary = summarize_conversation(messages)
        return [{
            "role": "user",
            "content": (
                "This conversation was compacted for continuity.\n\n"
                + summary
            ),
        }]
    ```

    这里最重要的是保住几类信息:

    * 当前目标是什么
    * 已经做了什么
    * 改过哪些文件
    * 还有什么没完成
    * 哪些决定不能丢

4. 在主循环里接入压缩

    ```text
    def agent_loop(state):
        while True:
            state["messages"] = micro_compact(state["messages"])

            if estimate_context_size(state["messages"]) > CONTEXT_LIMIT:
                state["messages"] = compact_history(state["messages"])
                state["has_compacted"] = True

            response = call_model(...)
            ...
    ```

5. 手动压缩和自动压缩复用同一条机制

    `compact` 工具不需要冲洗发明另一套逻辑, 只需要表达

    > 用户或模型现在主动要求执行一次完整压缩

### 压缩后, 真正要保住什么

一份合格的压缩结果, 至少要保住下面这些东西

1. 当前任务目标
2. 已完成的关键动作
3. 已修改或重点查看过的文件
4. 关键决定与约束
5. 下一步应该做什么

### 如何接到主循环里

现在, 主循环不只是

* 收消息
* 调模型
* 跑工具

还多一个关键的责任: 管理活跃上下文的预算

也就是说, agent loop 现在开始同时维护两件事

```text
任务推进
上下文预算
```
