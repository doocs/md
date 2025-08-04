interface Window {
  __MP_Editor_JSAPI__: {
    invoke: (params: {
      apiName: string
      apiParam: any
      sucCb: (res: any) => void
      errCb: (err: any) => void
    }) => void
  }
}

// eslint-disable-next-line
declare module '@exercism/highlightjs-gdscript' {
  export default LanguageFn
}
