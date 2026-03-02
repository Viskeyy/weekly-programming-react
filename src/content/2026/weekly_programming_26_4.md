# Weekly Programming 26-02

## Array.map() 和 Array.filter()

`map` 和 `filter` 方法都是遍历函数, 并且都是返回一个新数组. `map` 方法用于将数组中的每个元素映射到另一个值，而 `filter` 方法用于过滤数组中的元素

但最大的不同点是, `map` 方法返回的数组的长度, 始终与原始数组长度一样, 无论在 `map` 做了什么操作, 数组长度都不会改变. `filter` 方法则会改变数组长度.

## 前端跨网站传递数据的方法

几种最简单的跨网站传递数据的方法

* url query params
* 如果在 A 网站使用 `window.open` 打开 B 网站, 那么可以通过 `sessionStorage` 传递
* `localStorage`

## react-markdown 中渲染自定义组件

react-markdown中, 当 `rehypePlugin` 属性值 `[rehypeRaw]` ( `rehypeRaw` 通过 npm 安装) 时, 并且在 `components` 属性中声明了自定义组件之后, 就可以渲染自定义组件.

但在渲染包含自定义组件的字符串时, 如果自定义组件是自闭合标签, 例如 `<MyComponent />`, 那么在渲染时可能会出现问题, 但并不会报错.

因为 react-markdown 不知道如何渲染自闭合标签. 最简单的方法是将 `<MyComponent />` 改为 `<MyComponent></MyComponent>`.

## SubtleCrypto

SubtleCrypto 是一个 Web API, 用于在浏览器中执行加密操作.

`crypto.subtle.encrypt(algorithm, key, data)` 用于加密数据, `algorithm` 是加密算法, `key` 是加密密钥, `data` 是要加密的数据.

`crypto.subtle.decrypt(algorithm, key, data)` 用于解密数据, `algorithm` 是加密算法, `key` 是加密密钥, `data` 是要解密的数据.

`algorithm` 是一个对象, 下面是使用的加密算法和对应的 `algorithm` 对象:

* [`RSA-OAEP`](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/decrypt#rsa-oaep) : [`RsaOaepParams`](https://developer.mozilla.org/zh-CN/docs/Web/API/RsaOaepParams)
* [`AES-CTR`](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/encrypt#aes-ctr) : [`AesCtrParams`](https://developer.mozilla.org/zh-CN/docs/Web/API/AesCtrParams)
* [`AES-CBC`](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/encrypt#aes-cbc) : [`AesCbcParams`](https://developer.mozilla.org/zh-CN/docs/Web/API/AesCbcParams)
* [`AES-GCM`](https://developer.mozilla.org/zh-CN/docs/Web/API/SubtleCrypto/encrypt#aes-gcm) : [`AesGcmParams`](https://developer.mozilla.org/zh-CN/docs/Web/API/AesGcmParams)

如果使用 `AES-GCM` 算法, 那么 `algorithm` 则为 `{name: 'AES-GCM', iv: new Uint8Array(16), additionalData: new Uint8Array(0), tagLength: 128}`.

其中 `iv` 是初始化向量, `additionalData` 是附加数据, `tagLength` 是标签长度.

```ts
export const encrypt = async (plaintext: string): Promise<string> => {
    const ctBuf = await crypto.subtle.encrypt(
        { name: CRYPTO_NAME, iv: CRYPTO_IV, tagLength: CRYPTO_TAG_LENGTH },
        CRYPTO_KEY,
        new TextEncoder().encode(plaintext),
    )
    return Buffer.from(ctBuf).toString('base64')
}

export const decrypt = async (ciphertext: string): Promise<string> => {
    const ctBuf = await crypto.subtle.decrypt(
        { name: CRYPTO_NAME, iv: CRYPTO_IV, tagLength: CRYPTO_TAG_LENGTH },
        CRYPTO_KEY,
        Buffer.from(ciphertext, 'base64'),
    )
    return new TextDecoder().decode(ctBuf)
}
```

## URL 中的 query 参数

URL 的 query 参数中如果有 `+` 或其他特殊字符, 那么在获取时可能获取不到原始的参数.

如果 query 中含有特殊字符, 最简单的方式先将参数进行 `encodeURIComponent` 编码, 然后在获取时再进行 `decodeURIComponent` 解码.
