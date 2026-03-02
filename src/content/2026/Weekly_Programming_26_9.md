# Weekly Programming 26-09

## Antd 中 Modal 组件页脚按钮的加载状态

在 Antd 的 Modal 组件中, 默认情况下会有 `取消` 和 `确定` 两个按钮. 有时 `确定` 按钮是一个请求, 而需求是当请求完成后才会关闭弹窗.

同时需要做的时, 在请求时禁用 `确定` 按钮, 以避免再次发送请求.

然而当使用 `Modal.confirm` 时, 即使将 `okButtonProps` 设置为 `{ loading: true }`, 也无法控制按钮的状态.

此时可以通过使用 `<Modal>` 组件来控制按钮状态, 但这样更改较大, 并且可能会影响页面布局.

另一种方式是: 使用 `Modal.confirm` 的 `onOk` 回调函数来控制按钮状态. 当 `onOk` 为 `async` 函数时, 按钮会自动显示加载状态.

```tsx
import { Modal } from 'antd';

Modal.confirm({
  title: '确认操作',
  content: '确定要执行此操作吗？',
  onOk: async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
});
```
