const fs = require(`fs`)
const path = require(`path`)

const { 
  dcloud,
  parseArgv,
} = require(`./util.js`)

const arg = parseArgv()

// unicloud 服务空间配置
const spaceInfo = {
  spaceId: ``,
  clientSecret: ``,
  ...arg,
}

/**
 * 配置说明请参考文档: 
 * https://hongqiye.com/doc/mockm/config/option.html
 * @type {import('mockm/@types/config').Config}
 */
module.exports = util => {
  const port = Number(arg.port) || 9000
  return {
    api: {
      async '/upload'(req, res) {
        const multiparty = await util.toolObj.generate.initPackge(`multiparty`)
        const form = new multiparty.Form({
          uploadDir: `${__dirname}/public/upload/`,
        })
        form.parse(req, async (err, fields = [], files) => {
          const file = files.file[0]
          let url = `http://127.0.0.1:${port}/public/upload/${path.parse(file.path).base}`
          try {
            url = await dcloud(spaceInfo)({name: file.originalFilename, file: fs.createReadStream(file.path)})
          } catch (err) {
            // console.log(err)
          }
          res.json({url})
        })
      },
    },
    static: [
      {
        fileDir: `${__dirname}/dist`,
        path: `/md`,
      },
      { // 访问公共目录
        fileDir: `${__dirname}/public`,
        path: `/public`,
      },
    ],
  }
}
