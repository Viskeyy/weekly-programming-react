# Weekly Programming 26-02

## opencode 自定义 provider 配置

安装 opencode 之后, 在 `~/.config/opencode/opencode.json` 中可以自定义 provider (如果 `opencode.json` 不存在可以新增一个).

```jsonc
"example": {
 // 如果使用 openai, 则可以更改为 @ai-sdk/openai
  "npm": "@ai-sdk/anthropic",
  "name": "EXAMPLE",
  "options": {
    // 一般情况下需要添加 v1
    "baseURL": "https://example.com/v1"
  },
  // provider 支持的 models
  "models": {
    "claude-opus-4-5": {
      "name": "claude-opus-4-5
    },
    "claude-sonnet-4-5": {
      "name": "claude-sonnet-4-5"
    },
    "claude-haiku-4-5": {
      "name": "claude-haiku-4-5"
    }
  }
}
```

在编辑完 `opencode.json` 后, 在终端中使用 `opencode` 启动 opencode. 然后输入 `/connect` 选择之前配置的 provider (即 `example`), 在弹出的窗口中, 填写 provider 的 apiKey 即可.

## Squirrel 输入法配置

macOS 上的一个开源输入法, 自定义程度高, 通过配置文件基本上可以实现任何想要的效果.

如果使用现有的配置, 那么可以简单配置以下文件就是进行使用:

* `squirrel.yaml`: 主题, 字体, 字号. 候选框方向, 间距, 边框, 圆角等内容
* `default.yaml`: 一些全局的配置, 例如候选字个数, 输入方案 (全拼 \/ 双拼等), 选单按键, 上屏方式等
* `xxx.schema.yaml`: 所使用的方案的配置, 使用网上现有方案的花基本不需要配置

[squirrel 样式在线设计](https://pdog18.github.io/rime-soak) 这个网站支持可视化配置, 可以在这个网站上配置完成后, 将生成的内容粘贴到对应的文件中

## markedjs 渲染 markdown 时渲染出空白的 p 标签

在将 markdown 渲染为 html 时, 一般来说只需要将 markdown 内容传递给 markedjs, 经过解析之后插入到 html 标签中即可:

```js
const html = marked.parse(text)
```

但有时 `text` 的内容并不一定都是 markdown 内容, 例如: `text` 的最后包含了一段字符串格式的 html:

```js
const text = 'text' + '<div>example</div>'
```

此时如果进行 marked 渲染, 则会发现在渲染完成的 html 最后, 有一个多余的 `<p></p>`

这是因为在进行渲染时, 如果 `<div>example</div>` 前没有添加空行, 那么则会被视为行内元素. 此时的渲染结果为 `<p>text<div>content</div></p>`.

在浏览器中, 这个 html 是**无效**的, 当渲染这个**无效**的 html 时, 会自动修正为 `<p>text</p><div>example</div></p>`.

而浏览器为了闭合多余的 `</p>` 标签, 会将 html 再次自动修正为 `<p>text</p><div>example</div><p></p>`.

从而会多余出一个 `<p></p>`.

完整的流程可以这样理解:

1. 拼接的时候没有添加 `'\n\n'` 导致 `<div>example</div>` 被理解为行内元素
2. 渲染时使用了 `<p></p>` 包裹了 `<div></div>`, 生成无效的 html
3. 浏览器对标签自动修正为 `<p>text</p><div>example</div><p></p>`, 产生了空的 `<p></p>`

有时在渲染拼接的 markdown 时, 可能会出现间距不一样的问题, 那么有可能就是这个原因.
