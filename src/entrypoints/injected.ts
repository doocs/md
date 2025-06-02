export default defineUnlistedScript(() => {
  window.addEventListener(`copyToMp`, (e) => {
    const customEvent = e as CustomEvent
    window.__MP_Editor_JSAPI__.invoke({
      apiName: `mp_editor_set_content`,
      apiParam: {
        content: customEvent.detail.content,
      },
      sucCb: (res) => { console.log(`设置成功`, res) },
      errCb: (err) => { console.log(`设置失败`, err) },
    })
  })
})
