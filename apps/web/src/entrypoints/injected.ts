export default defineUnlistedScript(() => {
  window.addEventListener(`message`, (event) => {
    console.log(`收到 copyToMp 事件`, event)
    if (event.data.type !== `copyToMp`)
      return
    window.__MP_Editor_JSAPI__.invoke({
      apiName: `mp_editor_set_content`,
      apiParam: {
        content: event.data.content,
      },
      sucCb: (res) => { console.log(`设置成功`, res) },
      errCb: (err) => { console.log(`设置失败`, err) },
    })
  })
})
