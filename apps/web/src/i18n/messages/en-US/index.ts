import ai from './ai'
import chrome from './chrome'
import common from './common'
import dialog from './dialog'
import editor from './editor'
import store from './store'
import upload from './upload'

export default {
  ...common,
  ...chrome,
  ...dialog,
  ...editor,
  ai,
  upload,
  store,
}
