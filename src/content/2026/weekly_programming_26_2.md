# Weekly Programming 26-02

## 自动滚动到底部

在 web app 开发过程中, 有时需要添加自动滚动的功能. 尤其是现在 AI 聊天的页面中, 在属于对话的这个区域内, 一般都使用自动滚动来保持最新的内容可见.

之前实现自动滚动, 往往是对整个对话区域使用 dom 操作.

即假设这个对话区域为 `<Messages>`, 每个消息的区域为 `<Message>`:

```html
<Messages ref={messagesRef}>
  <Message/>
  <Message/>
  <Message/>
</Messages>
```

通过为 `<Messages>` 添加一个 `ref` 属性, 然后在组件的 `useEffect` 钩子中使用 `ref.current.scrollTop = ref.current.scrollHeight` 来实现自动滚动.

这样的方式有这样的一个问题: 如果对话过长, 对整个 `<Messages>` 的 dom 操作会有较大的性能开销.

---

另一种方法是, 使用一个空标签, 每次都对这个空标签进行 dom 操作, 使其滚动到底部:

```html
<Messages>
  <Message/>
  <Message/>
  <Message/>
  <div ref={scrollRef} />
</Messages>
```

在 `<Messages>` 内容区域的最下发, 添加了 `<div ref={scrollRef} />` 标签. `useEffect` 中, 使用 `scrollRef.current?.scrollIntoView()` 将这个空标签滚动到可视区域内.

这样, 不需要每次计算滚动高度, 并且将 dom 操作限制在这个空标签中, 避免对整个区域进行 dom 操作.

## js 中的小数计算

这是一个所有的前端开发者都会遇到的问题, js 中的小数计算, 并不是精确的计算.

例如 `0.1 + 0.2` 的结果是 `0.30000000000000004`. 对于某些计算后判断是否相等的情况, 总会出现错误.

在不借助外部库的情况下, 当明确知道是几位小数时, 可以将其转换为整数计算再除以对应倍数:

```js
(0.1 * 10 + 0.2 * 10) / 10
```

看起来会麻烦许多, 但在需要精确计算的情况下, 总不会出错

## tailwindcss 中的 markdown 渲染

在将 markdown 语句渲染为 html 时, 如果使用的是 Tailwind CSS 样式库, 那么可能不会有效果.

因为 Tailwind CSS 存在一个名为 `Preflight` 的样式表, 它会删除一些默认的样式, 例如标题, 列表, 下划线等样式, 从而导致 markdown 渲染的样式失效.

`@tailwindcss/typography` 这个官方插件, 在 Tailwind CSS 中为 markdown 渲染结果提供了默认样式, 在 markdown 渲染组件中添加 `className="prose"` 来使用这个插件.

## macOS 上没什么大用的小工具

`networkQuality`, 在 macOS 的终端中输入, 可以查看网络情况:

```zsh
Downlink: 61.967 Mbps, 75 RPM - Uplink: 69.616 Mbps, 75 RPM
```
