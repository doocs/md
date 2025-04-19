import { onRequestPost as post } from '../../material/add_material/index'

export const onRequestPost: PagesFunction = async (context) => {
  return post(context)
}
