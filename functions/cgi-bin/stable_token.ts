import { jsonResponse, MP_HOST } from '../utils'

export const onRequestPost: PagesFunction = async (context) => {
  const response = await fetch(
    `${MP_HOST}${context.functionPath}`,
    {
      method: `POST`,
      body: context.request.body,
    },
  )
  const json = await response.json()
  return jsonResponse(json)
}
