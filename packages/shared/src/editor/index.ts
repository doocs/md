export * from './basicSetup'
export * from './format'
export * from './history'
export * from './markdown'
export * from './themes'

// cssSetup / javascriptSetup stay out of the barrel on purpose: they statically
// pull @codemirror/lang-css / lang-javascript (+ @lezer grammars), which only
// lazy components need. Import them via '@md/shared/editor/css' or
// '@md/shared/editor/javascript' so the grammars remain off the critical path.
