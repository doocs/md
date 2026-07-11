import { Marked } from 'marked'
import { markedAlert, MDKatex } from '../extensions'

/** Generate themeless pure HTML (for export / preview). */
export async function generatePureHTML(raw: string): Promise<string> {
  const markedInstance = new Marked()
  markedInstance.use(markedAlert({ withoutStyle: true }))
  markedInstance.use(MDKatex({ nonStandard: true }, false))
  return await markedInstance.parse(raw)
}
