module.exports = {
  publicPath: process.env.SERVER_ENV === `NETLIFY` ? `/` : `/md/`, // 基本路径, 建议以绝对路径跟随访问目录
  css: {
    sourceMap: true,
  },
}
