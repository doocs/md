import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createProxyMiddleware } from 'http-proxy-middleware'
import {
  dcloud,
  parseArgv,
} from './util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const arg = parseArgv()

// unicloud 服务空间配置
const spaceInfo = {
  spaceId: ``,
  clientSecret: ``,
  ...arg,
}

/**
 * 创建 Express 服务器
 * @param {number} port - 服务器端口
 */
export function createServer(port = 8800) {
  const app = express()

  // 确保上传目录存在
  const uploadDir = path.join(__dirname, 'public/upload')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // 配置 multer 用于文件上传
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  })

  const upload = multer({ storage })

  // 中间件
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use('/public', express.static(path.join(__dirname, 'public')))

  // 文件上传 API
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      // 检查是否配置了云存储
      if (!spaceInfo.spaceId || !spaceInfo.clientSecret) {
        // 删除临时上传的文件
        fs.unlinkSync(req.file.path)

        return res.status(400).json({
          error: '图片上传需要配置云存储服务',
          message: '微信公众号无法访问本地图片，请配置 unicloud 服务。使用方法：md-cli spaceId=your_space_id clientSecret=your_secret',
          needCloudConfig: true
        })
      }

      const file = req.file

      // 上传到 unicloud
      try {
        const url = await dcloud(spaceInfo)({
          name: file.originalname,
          file: fs.createReadStream(file.path)
        })

        // 上传成功后删除本地临时文件
        fs.unlinkSync(file.path)

        res.json({ url })
      } catch (err) {
        // 上传失败，删除临时文件
        fs.unlinkSync(file.path)

        console.error('unicloud upload failed:', err.message)
        res.status(500).json({
          error: '图片上传到云端失败',
          message: '请检查 unicloud 配置是否正确：' + err.message,
          cloudError: true
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({ error: error.message })
    }
  })

  app.get('/', (_, res) => {
    res.redirect('/md/')
  })

  console.log('代理到: https://doocs-md.pages.dev')
  app.use(createProxyMiddleware({
    target: 'https://doocs-md.pages.dev',
    changeOrigin: true,
    onError: (err, req, res) => {
      console.error(`代理错误 ${req.path}:`, err.message)
      res.status(502).send('代理服务暂不可用，请检查网络连接')
    },
  }))

  return app
}
