# Weekly Programming 26-10

## Antd Form.Item 组件中的 Upload 组件

在 Antd 中, 当使用 Form.Item 包裹 Upload 组件时, 如果想要将 Upload 中的 fileList 值赋予 Form.Item, 那么 Form.Item 中只能 Upload 组件.

```tsx
<Form.Item>
    <Upload />
</Form.Item>
```

如果 Form.Item 中包含了其他内容, 那么就会无法将 Upload 组件中的 fileList 的值赋予 Form.Item, 即使 Form.Item 中只是包含了 Upload 组件和一段文本内容, 也无法正确赋值.

```tsx
// 由于在 Form.Item 中添加了文本, 则会导致 Form.Item 获取不到 Upload 组件中的值
<Form.Item>
    <Upload />
    text
</Form.Item>
```
