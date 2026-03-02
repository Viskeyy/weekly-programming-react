# Weekly Programming 26-06

## 微信小程序开发中的流式请求处理

```ts
/**
* @description 微信小程序流式响应处理方案
*
* 【技术限制】
* 微信小程序的标准 request 方法不原生支持处理流式响应（streaming response），
* 导致无法使用常规的流处理方法。
*
* 【解决方案】
* 1. 利用 wx.request 的 `enableChunked: true` 选项启用分块传输
* 2. 通过 `onChunkReceived` 回调函数捕获数据块
* 3. 在回调中对接收到的 buffer stream 进行实时处理
*
* @example
* wx.request({
*   url: 'https://example.com/api',
*   enableChunked: true,
* });
*
* @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
* @note 使用此方法处理大型响应时，请注意内存管理，避免内存泄漏
*/

/**
* @description Buffer转字符串处理方案
*
* 【环境限制】
* 微信小程序JavaScript运行环境中不提供标准的TextDecoder API，
* 导致无法使用常规Web方法解码二进制数据。
*
* 【技术方案】
* 1. 使用`Uint8Array`类型化数组直接操作接收到的buffer
* 2. 通过自定义解码逻辑将二进制数据转换为字符串
* 3. 支持UTF-8等编码格式的正确解析
*
* @example
* // 将buffer转换为字符串
* function bufferToString(buffer) {
*   const uint8Array = new Uint8Array(buffer);
*   return Array.from(uint8Array)
*     .map(byte => String.fromCharCode(byte))
*     .join('');
* }
*
* @see https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html
*/

const requestTask = Taro.request({
  enableChunked: true,
  header: {
    "Content-Type": "application/json",
    Authorization: "Bearer",
  },
  url: "https://api.vivgrid.com/v1/chat/completions",
  method: "POST",
  data: {
    messages: [...messages.slice(-4), userMessage],
    stream: true,
  },

  success: () => {
    setLoading(false);
  },

  fail: (err) => {
    console.log(err, "err");
    setLoading(false);
  },
});

function handleChunkLine(line: string) {
  if (line === "data: [DONE]") {
    setLoading(false);
    setMessages((prev) => {
      updateCurrentSessionMessages(prev);
      return prev;
    });
    updateCurrentSessionTitle(dayjs().format("YYYY-MM-DD HH:mm"));
    return;
  }

  if (line.startsWith("data:")) {
    try {
      const json = JSON.parse(line.replace("data:", "").trim());
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) {
        assistantContent += delta;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: assistantContent,
            };
          }
          return updated;
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
}

requestTask.onChunkReceived((res) => {
  let text = "";
  if (typeof res.data === "string") {
    text = res.data;
  } else if (res.data instanceof ArrayBuffer) {
    text = arrayBufferToString(res.data);
  }
  for (const line of text.split("\n")) {
    handleChunkLine(line);
  }
});
```

## 微信小程序中调用键盘时页面整体上移的情况

在小程序中调用键盘时, 会导致页面上移. 如果此时设置了页面高度会随键盘高度的改变而改变, 那么将会出现明显的布局偏移, 用户体验上会有很大的影响.

此时需要为输入框添加 `adjustPositon` 属性并设置为 `false`. 这样整个页面就不会上移, 此时再调整页面高度, 将会有流畅的用户体验.

无论是 Input 还是 Textarea 或任何需要调用键盘的输入, 都可以添加这个属性

## JavaScript 中的 7 种原始类型

string, number, bigint, boolean, symbol, null, undefined.
