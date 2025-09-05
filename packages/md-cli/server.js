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
  colors
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

      const file = req.file
      let url = `http://127.0.0.1:${port}/public/upload/${file.filename}`

      try {
        if (spaceInfo.spaceId && spaceInfo.clientSecret) {
          url = await dcloud(spaceInfo)({
            name: file.originalname,
            file: fs.createReadStream(file.path)
          })

          // 上传成功后删除本地临时文件
          fs.unlinkSync(file.path)
          console.log('文件已上传到云端:', url)
        } else {
          console.log(`${colors.yellow('未配置云存储，降级到本地存储')}`)
        }
      } catch (err) {
        // 云上传失败，降级到本地存储
        console.log('云存储上传失败，降级到本地存储:', err.message)
      }

      res.json({ url })
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
