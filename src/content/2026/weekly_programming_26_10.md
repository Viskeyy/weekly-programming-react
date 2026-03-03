# Weekly Programming 26-10

## 在使用 Rsbuild 构建的 web app 中, 将静态资源导入到 js 中

Rsbuild 支持通过 `?raw` 查询参数引用静态资源的原始内容, 并将其作为字符串导入到 js 中

例如, 项目中存在 `src/content/demo.md` 文件, 如果要展示文件中的内容, 则可以使用:

```ts
import demo from '@/content/demo.md?raw'
```

这样, `demo.md` 文件就会转换为字符串格式的内容, 就可以在渲染时直接使用
