# Weekly Programming 26-27

## JavaScript 底层运行

在屏幕上出现任何内容之前, JavaScript 会在 *引擎* 和 *环境* 内执行一系列步骤

### 1. JavaScript 处理管道 (pipeline)

在代码运行之前, JavaScript 引擎会将其从文本逐步转换为 CPU 可执行的内容

这个过程 -- JavaScript 处理管道 (*JavaScript processing pipeline*) -- 主要分为 4 个阶段

1. 词法分析 / 标记处理
    * 引擎扫描源代码并将其拆分为 token (最小的有意义的单位), 例如 `const`, `sum` `=`...
2. 解析
    * 解析器将 token 转换为抽象语法树 (Abstract Syntax Tree, AST)
    * 如果发现语法错误, 执行会立即停止, 并返回解析时错误 (SyntaxError)
3. 汇编
    * 解释器将 AST 转换为字节码 (bytecode, V8 使用 Ignition)
    * JIT 编译器可以进一步优化 hot 代码路径为机器码 (machine code, V8 使用 TurboFan)
4. 运行时执行
    * CPU 执行字节码或机器码
    * 引擎使用桟 (stack) 和 堆 (heap) 管理内存中的变量, 函数和对象

### 2. 运行时的核心组件

#### Heap 堆

* 堆是一个很大的, 大部分是非结构化的内存区域, 用于存储对象, 数组和函数
* 桟中通常保存这些堆对象的引用

#### Stack 桟 (call stack, 调用桟)

* 桟是一种后进先出 (LIFO) 结构, 引擎使用它来跟踪当前正在运行的函数
* 当函数完成时, 其执行上下文将从桟中弹出
* 如果桟为空, 事件循环 (event loop) 可以分派新任务

#### Event Loop 事件循环

事件循环是 JavaScript 的调度程序, 它通过重复执行以下操作来保持单线程代码的响应能力:

完成桟上的内容, 运行任何队列的微任务 (microtask), 可选择是否让浏览器渲染, 然后获取下一个宏任务(macrotask)

### 3. 运行时视图

下面是基于 MDN 代理模型图的堆, 桟, 队列和事件循环如何交互的视图

```text
+------------------------------------------------------+
|  JavaScript Runtime (Browser / Node.js)              |
|                                                      |
|  +-------------------+    +---------------------+    |
|  | Heap              |    | Call Stack          |    |
|  |  {objects, arrays}|    | main()              |    |
|  |  functions        |    | foo()               |    |
|  +-------------------+    +---------------------+    |
|            ^                        |                |
|            |                        v                |
|  +-------------------+   +-----------------------+   |
|  | Task Queues       |   | Event Loop            |   |
|  |  [Macrotasks]     |<--| (checks, dispatches)  |   |
|  |  [Microtasks]     |   +-----------------------+   |
+------------------------------------------------------+
```

#### 示例: 函数如何在后台执行

```js
function foo() {
  console.log('Inside foo');
};

function bar() {
  console.log('Start bar');
  foo();
  console.log('End bar');
}

console.log('Start');
bar();
console.log('End');
```

1. 引擎将编译后的 `foo` 和 `bar` 函数对象存储在**堆**中
2. 引擎创建全局可执行上下文对象并将其推送到**调用栈**上
3. 运行 `console.log('Start')`:
    * 将 `console.log('Start')` 函数调用对象推送到**调用栈**上
    * 执行它 (打印 "Start")
    * 将其弹出
4. 遇到 `bar()`
    * 创建 `bar()` 的可执行上下文对象并将其推送到**调用栈**上
5. 在 `bar()` 内运行 `console.log('Start bar')`:
    * 推送 `console.log('Start bar')` 函数调用对象
    * 执行 (打印 "Start bar")
    * 弹出
6. 调用 `foo()`
    * 创建 `foo()` 的可执行上下文对象并推送到**调用栈**上
7. 在 `foo()` 内运行 `console.log('Inside foo')`
    * 将 `console.log('Inside foo')` 推送到**调用栈**上
    * 执行 (打印 "Inside foo")
    * 弹出
8. 从调用桟中弹出 foo 的可执行上下文对象
9. 返回 `bar()`, 运行 `console.log('End bar')`
    * 推送 `console.log('End bar')` 到**调用栈**上
    * 执行 (打印 "End bar")
    * 弹出
10. 将 `bar()` 的可执行上下文对象从调用栈中弹出
11. 返回全局上下文, 运行 `console.log('End')`
    * 推送 `console.log('End')` 到**调用栈**上
    * 执行 (打印 "End")
    * 弹出
12. 将全局可执行上下文对象从**调用栈**上弹出
13. **调用栈**为空, 事件循环检查微任务队列和宏任务队列是否有待处理的回调

### 4. JavaScript 的单线程性质

JavaScript 在每个运行环境中 (浏览器, Node.js 进程或 worker) 中一次执行一项任务

只有一个调用桟, 因此长时间运行的同步操作当阻塞渲染, 事件处理和异步回调

### 5. 微任务与宏任务

JavaScript 在两个主要存储桶中安排异步工具

#### 微任务 Microtasks

* 使用在移动到下一个宏任务之前运行
* 示例: promise`.then`, `queueMicrotask`

#### 宏任务 Macrotasks

* 安排在主时间循环周期中执行
* 示例: `setTimeout`, `setInterval`, 网络事件

示例:

```js
setTimeout(() => console.log('MacroTasks'), 0);
Promise.resolve().then(() => console.log('Microtasks'));

// Output:
// Microtasks
// Macrotasks
```

### 6. 同步执行与异步执行

JavaScript 可以以两种不同的方式运行代码: 同步 (synchronously) 和 异步 (asynchronously)

#### 同步执行 (阻塞)

代码从上到下逐行执行

在运行任何队列中的任务之前, 必须完全清除调用栈

示例:

```js
console.log('A');
console.log('B');
console.log('C');

// Output: A, B, C
```

底层:

1. 将全局可执行上下文压入桟中
2. 运行 `console.log('A')`: 压入, 执行, 弹出
3. 运行 `console.log('B')`: 压入, 执行, 弹出
4. 运行 `console.log('B')`: 压入, 执行, 弹出
5. 桟为空, 时间循环检查**队列**

Block 示例:

```js
console.log('Start');

for (let i = 0; i < 1e9; i++) {} // Heavy computation

console.log('End')
```

该循环使桟保持忙碌状态, 直到完成位置, 从而阻塞其他所有操作 - 包括 UI 更新

#### 异步执行 (不阻塞)

异步执行允许 JavaScript 处理长时间运行的操作, 而无需暂停程序的其余部分

`setTimeout` 底层:

```js
console.log('A');

setTimeout(() => console.log('B'), 0);

console.log('C');
```

输出:

```js
1. log `A`
2. call `setTimeout`:
    * 将定时器设置交给运行时的 Timer API
    * Timer 在引擎之外运行
3. log `C`
4. 桟为空 -> 运行微任务 (这里没有微任务) -> 运行宏任务 (log `B`)
```

`async/await` 底层:

```js
async function example() {
  console.log('1');
  await Promise.resolve();
  console.log('2')
}

console.log('A')
example()
console.log('B')
```

输出:

```js
1. log `A`
2. 调用 `example()`, 打印 `1`
3. `await Promise.resolve()` 会将后续操作调度到微任务队列中
4. log `B`
5. 桟为空 -> 运行微任务 (log `2`) -> 运行宏任务 (此处没有宏任务)
```

### 7. 什么时候使用 `queueMicrotask` 和 `setTimeout`

JavaScript 主要通过两种方式安排异步工作:

* **Microtasks**: 在当前任务之后, 渲染之前运行
* **Macrotasks**: 在微任务之后,并且可能在渲染完成之后运行

`queueMicrotasks` 将工作添加到**微任务队列** (运行更快)

而 `setTimeout` 将工作添加到**宏任务**队列 (稍后运行)

简而言之:

* `queueMicrotasks` 适合无阻塞的立即执行的逻辑
* `setTimeout` 适合让浏览器更新 UI 或分解繁重的任务

示例: 执行订单

```js
console.log('1: synchronously start');

queueMicrotask(() => {
  console.log('2: queueMicrotask')
})

setTimeout(() => {
  console.log('3: setTimeout')
}, 0);

console.log('4: synchronously end')
```

输出:

```js
1: synchronously start
4: synchronously end
2: queueMicrotask
3: setTimeout
```

为什么:

* `queueMicrotasks` 在当前同步代码之后, 任何 `setTimeout` 之前运行
* 在所有微任务完成后, `setTimeout` 等待下一个宏任务阶段

### 8. 避免长时间运行的同步操作

长时间运行同步操作是 JavaScript 程序中最大的性能杀手之一, 由于 JavaScript 是单线程的, 任何独占桟的操作都会冻结整个程序

#### 为什么长时间运行的操作会出现问题

当同步操作运行时间过长时:

* UI 变慢无响应 - 按钮无法点击, 无法滚动
* 动画卡顿 - CSS 动画和过渡停止
* 时间程序无法触发 - 用户输入被忽略
* 计时器延迟 - `setTimeout` 回调无法执行
* 网络响应排队 - 获取 XHR 的回调被阻止

#### 避免阻塞的策略

##### 1. 使用 `setTimeout` 进行分块

```js
// process array in chunks
async function processHugArrayChunked(items, chunkSize = 100) {
  const results = []

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    chunk.forEach(item => {
      results.push(expensiveOperation(item));
    });

    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return results
}
```

##### 2. 使用 `requestIdleCallback`

当浏览器空闲时安排非关键工作:

```js
/**
 * 使用 requestIdleCallback 分片处理超大数组
 * @param {Array} items - 待处理的数据数组
 * @returns {Promise<Array>} - 处理后的结果数组
 */
function processHugeArrayIdle(items) {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;

    function runIdle(deadline) {
      // 当数组还没处理完，且当前帧还有剩余时间（或者任务超时了）时，持续执行
      while (index < items.length && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
        results.push(expensiveOperation(items[index]));
        index++;
      }

      // 如果还没处理完，继续申请下一个空闲时段
      if (index < items.length) {
        requestIdleCallback(runIdle, { timeout: 1000 }); // 设置 timeout 避免任务被无限期饿死
      } else {
        // 全部处理完毕，resolve 结果
        resolve(results);
      }
    }

    // 启动空闲调度
    requestIdleCallback(runIdle, { timeout: 1000 });
  });
}
```

### 9. 浏览器与 Node.js 事件循环

浏览器遵循 [WHATWG HTML event loop model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)

Node.js 使用事件循环, 它有多个影响回调顺序的阶段

### 10. 渲染和水化

浏览器在宏任务结束时清除微任务后进行渲染

框架中的水化 (Hydration) 将 JavaScript 行为附加到预渲染的 HTML - 这是一个框架问题, 而不是核心事件循环的一部分
