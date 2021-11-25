/**
 * 配置说明请参考文档:
 * https://hongqiye.com/doc/mockm/config/option.html
 * @type {import('mockm/@types/config').Config}
 */
module.exports = (util) => {
  const port = 9000
  return {
    port,
    api: {
      async '/upload'(req, res) {
        const multiparty = await util.toolObj.generate.initPackge(`multiparty`)
        const form = new multiparty.Form({
          uploadDir: `./public/upload/`,
        })
        form.parse(req, (err, fields = [], files) => {
          const path = files.file[0].path.replace(/\\/g, `/`)
          const url = `http://127.0.0.1:${port}/${path}`
          res.json({
            msg: `上传成功`,
            url,
          })
        })
      },
    },
    static: [
      { // 测试 netlify 部署
        fileDir: `./dist`,
        path: `/`,
      },
      { // 测试 gitee/github 部署
        fileDir: `./dist`,
        path: `/md`,
      },,
      { // 访问公共目录
        fileDir: `./public`,
        path: `/public`,
      },
    ],
  }
}
