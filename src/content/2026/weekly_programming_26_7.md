# Weekly Programming 26-07

## Promise 中的并行请求

Promise.all() 方法用于将多个 Promise 实例包装成一个新的 Promise 实例, 该实例的状态取决于多个 Promise 实例的状态.

如果所有 Promise 实例都成功, 则返回的 Promise 实例状态为成功；如果有一个 Promise 实例失败，则返回的 Promise 实例状态为失败.

    举个例子:

    有两个请求 a 和 b, 如果使用 `await`, 那么这两个请求是串行的, 只有前面的 a 执行完毕后, 才会执行后面的 b.

    如果使用 `Promise.all`, 那么这两个请求是并行的, 两个请求同时开始执行, 两个请求都执行完毕后, 才会执行后面的代码.

页面上如果有多个请求同时进行, 那么使用 `Promise.all` 可以实现显著提升加载速度.
