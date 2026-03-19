# Weekly Programming 26-11

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

## CSS 中的 `zoom` 和 `scale` 属性

在原生的 CSS 中, 这两个属性都对某个元素进行缩放.

区别在于 `scale` 只是改变了外观, 元素的布局大小保持不变; 而 `zoom` 会真正地缩放元素及布局.

例如, 如果一个元素下方紧挨着文字, 在使用 `scale` 属性进行放大时, 会遮挡文字. 但是如果使用 `zoom` 进行方法, 则文字还是紧挨元素下方.
