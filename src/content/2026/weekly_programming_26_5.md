# Weekly Programming 26-05

## useQuery 中的错误捕获问题

在 useQuery 中, 如果代码中出现错误, 例如简单的 `const xxx = yyy`, 其中 `xxx` 和 `yyy` 是变量名, 并且都未定义.

此时如果执行这个 query, 那么即使变量未定义, 这个 query 也不会抛出错误.

只有在 `onError` 中捕获错误, 才能正确地处理错误.

目的是将异步操作的错误隔离处理, 防止未捕获的异常中断应用. 因此，必须显式使用 onError 回调或检查 error 状态来处理 queryFn 中的错误.
