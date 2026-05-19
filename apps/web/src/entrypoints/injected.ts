export default defineUnlistedScript(() => {
  window.addEventListener(`message`, (event) => {
    if (event.data.type !== `copyToMp`)
      return
    window.__MP_Editor_JSAPI__.invoke({
      apiName: `mp_editor_set_content`,
      apiParam: {
        content: event.data.content,
      },
      sucCb: () => {},
      errCb: () => {},
    })
  })
})
