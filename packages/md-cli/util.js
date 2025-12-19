import process from 'node:process'
import util from 'node:util'

/**
 * 自定义控制台颜色
 * https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
 * nodejs 内置颜色: https://nodejs.org/api/util.html#util_foreground_colors
 */
function colors() {
  function colorize(color, text) {
    const codes = util.inspect.colors[color]
    return `\x1B[${codes[0]}m${text}\x1B[${codes[1]}m`
  }

  const returnValue = {}
  Object.keys(util.inspect.colors).forEach((color) => {
    returnValue[color] = text => colorize(color, text)
  })

  const colorTable = new Proxy(returnValue, {
    get(obj, prop) {
      // 在没有对应的具名颜色函数时, 返回空函数作为兼容处理
      const res = obj[prop] ? obj[prop] : arg => arg
      return res
    },
  })

  // 取消下行注释, 查看所有的颜色和名字:
  // Object.keys(returnValue).forEach((color) => console.log(returnValue[color](color)))
  return colorTable
}

/**
 * 解析命令行参数
 * @param {*} arr
 * @returns {Record<string, string | boolean>}
 */
function parseArgv(arr) {
  return (arr || process.argv.slice(2)).reduce((acc, arg) => {
    let [k, ...v] = arg.split(`=`)
    v = v.join(`=`) // 把带有 = 的值合并为字符串
    acc[k] = v === `` // 没有值时, 则表示为 true
      ? true
      : (
        /^(true|false)$/.test(v) // 转换指明的 true/false
          ? v === `true`
          : (
            /[\d|.]+/.test(v)
              ? (Number.isNaN(Number(v)) ? v : Number(v)) // 如果转换为数字失败, 则使用原始字符
              : v
          )
      )
    return acc
  }, {})
}

const colorsInstance = colors()

export {
  parseArgv,
  colorsInstance as colors,
}
