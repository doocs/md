import express from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createProxyMiddleware } from 'http-proxy-middleware'
import {
  dcloud,
  parseArgv,
  colors
} from './util.js'
import { renderMarkdown } from './renderer.js'

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

  // API Route for Rendering Markdown
  app.post('/api/render', async (req, res) => {
    try {
      let {
        markdown,
        path: filePath,
        theme = 'default',
        primaryColor = '#0F4C81',
        fontFamily = "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif",
        fontSize = '16px',
        highlightTheme = 'github'
      } = req.body;

      if (!markdown && filePath) {
        if (fs.existsSync(filePath)) {
          markdown = fs.readFileSync(filePath, 'utf-8');
        } else {
          return res.status(400).json({ error: 'File not found' });
        }
      }

      if (!markdown) {
        return res.status(400).json({ error: 'Markdown content is required' });
      }

      const { html } = renderMarkdown(markdown, {
        theme,
        primaryColor,
        fontFamily,
        fontSize,
        isMacCodeBlock: true,
        isShowLineNumber: true,
        highlightTheme
      });

      res.json({ html });
    } catch (error) {
      console.error('Render error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Rendering Markdown to HTML file (Preview)
  app.post('/api/render/html', async (req, res) => {
    try {
      let {
        markdown,
        path: filePath,
        theme = 'default',
        primaryColor = '#0F4C81',
        fontFamily = "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif",
        fontSize = '16px',
        highlightTheme = 'github'
      } = req.body;

      if (!markdown && filePath) {
        if (fs.existsSync(filePath)) {
          markdown = fs.readFileSync(filePath, 'utf-8');
        } else {
          return res.status(400).send('File not found');
        }
      }

      if (!markdown) {
        return res.status(400).send('Markdown content is required');
      }

      const { html } = renderMarkdown(markdown, {
        theme,
        primaryColor,
        fontFamily,
        fontSize,
        isMacCodeBlock: true,
        isShowLineNumber: true,
        highlightTheme
      });

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Render Preview</title>
</head>
<body>
  ${html}
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(fullHtml);
    } catch (error) {
      console.error('Render error:', error);
      res.status(500).send(error.message);
    }
  });

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
