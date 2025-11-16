import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
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
 * 获取上传目录
 * pkg 打包环境下，虚拟文件系统不可写，需要使用系统临时目录
 */
function getUploadDir() {
  // 检测是否在 pkg 打包环境中
  if (process.pkg !== undefined) {
    // pkg 环境：使用系统临时目录
    const dir = path.join(tmpdir(), 'md-cli-upload')
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    return dir
  }
  // 开发环境：使用相对路径
  return path.join(__dirname, 'public/upload')
}

/**
 * 获取静态资源目录
 */
function getPublicDir() {
  // pkg 环境下，静态资源在虚拟文件系统中，可以正常访问
  return path.join(__dirname, 'public')
}

/**
 * 创建 Express 服务器
 * @param {number} port - 服务器端口
 */
export function createServer(port = 8800) {
  const app = express()

  // 获取上传目录
  const uploadDir = getUploadDir()
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // 获取静态资源目录
  const publicDir = getPublicDir()

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

  // 静态资源服务
  app.use('/public', express.static(publicDir))

  // 如果使用临时目录，添加额外的上传文件访问路由
  if (process.pkg !== undefined) {
    app.use('/uploads', express.static(uploadDir))
  }

  // 文件上传 API
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const file = req.file
      // pkg 环境下使用不同的 URL 路径
      const uploadPath = process.pkg !== undefined ? '/uploads' : '/public/upload'
      let url = `http://127.0.0.1:${port}${uploadPath}/${file.filename}`

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

  console.log('代理到: https://md.doocs.org/')
  app.use(createProxyMiddleware({
    target: 'https://md.doocs.org/',
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error(`代理错误 ${req.path}:`, err)
        res.status(502).send(`代理服务暂不可用，请检查网络连接 ${err.message}`)
      },
    },
  }))

  return app
}
