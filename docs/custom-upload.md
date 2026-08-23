# 自定义上传

在工具上没有提供预定义图床的情况下，你只需要自定义上传逻辑即可，这对于例如你不方便使用公共图床，而是使用自己的上传服务时非常有用。

你只需要在给定的函数中更改上传代码即可，为了方便，这个函数提供了可能使用的一些参数：

推荐使用 `fetch` 的示例：

```js
const { file, util, okCb, errCb } = CUSTOM_ARG
const param = new FormData()
param.append(`file`, file)

try {
  const res = await fetch(`http://127.0.0.1:8800/upload`, {
    method: `POST`,
    body: param,
  })
  const data = await res.json()
  okCb(data.url)
}
catch (err) {
  errCb(err)
}
```

兼容旧脚本的 `util.axios` 写法（`axios` / `CryptoJS` / `Buffer` 都是别名，不是独立 npm 包）：

```js
const { file, util, okCb, errCb } = CUSTOM_ARG
const param = new FormData()
param.append(`file`, file)
util.axios
  .post(`http://127.0.0.1:8800/upload`, param, {
    headers: { 'Content-Type': `multipart/form-data` },
  })
  .then((res) => {
    okCb(res.url)
  })
  .catch((err) => {
    errCb(err)
  })
```

可用参数：

```js
// CUSTOM_ARG = {
//   content, // 待上传图片的 base64
//   file, // 待上传图片的 file 对象
//   util: {
//     axios, // fetch 包装，API 形状兼容 axios（get/post/…）
//     CryptoJS, // crypto-es 的 crypto-js 兼容层
//     S3, // @aws-sdk/client-s3 (S3Client, PutObjectCommand)
//     Buffer, // buffer-from
//     uuidv4, // uuid
//     qiniu, // qiniu-js
//     tokenTools, // utf16to8 / base64encode / safe64
//     getDir, // 获取 年/月/日 形式的目录
//     getDateFilename, // 根据文件名获取它以 时间戳+uuid 的形式
//   },
//   okCb: resolve, // 重要！上传成功后给此回调传 url 即可
//   errCb: reject, // 上传失败调用的函数
// }
```

如果你创建了适用于其他第三方图床的上传代码，我们非常欢迎你分享它。
