import { Marked } from 'marked'
import { markedAlert, MDKatex } from '../extensions'

/** 生成无主题样式的纯 HTML（导出 / 预览用） */
export async function generatePureHTML(raw: string): Promise<string> {
  const markedInstance = new Marked()
  markedInstance.use(markedAlert({ withoutStyle: true }))
  markedInstance.use(MDKatex({ nonStandard: true }, false))
  return await markedInstance.parse(raw)
}
