module.exports = {
  publicPath: process.env.SERVER_ENV === `NETLIFY` ? `/` : `/md/`, // 基本路径, 建议以绝对路径跟随访问目录
  outputDir: process.env.SERVER_ENV === `NETLIFY` ? `./dist/` : `./dist/md/`, // 输出文件目录
  css: {
    sourceMap: true,
  },
}
