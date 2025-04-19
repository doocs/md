import { parseFormDataRequest } from '../../../parseFormDataRequest'
import { jsonResponse, MP_HOST } from '../../../utils'

export const onRequestPost: PagesFunction = async (context) => {
  const formData = (await parseFormDataRequest(context.request)) as FormData
  const url = new URL(context.request.url)
  const response = await fetch(
    `${MP_HOST}${context.functionPath}${url.search}`,
    {
      method: `POST`,
      body: formData,
    },
  )
  const json = await response.json()
  return jsonResponse(json)
}
