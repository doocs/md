import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: true,
  ignores: [`.github`, `scripts`, `docker`, `packages/md-cli`, `src/assets`, `example`],
}, {
  rules: {
    'semi': [`error`, `never`],
    'quotes': [`error`, `backtick`],
    'no-unused-vars': `off`,
    'no-console': `off`,
    'no-debugger': `off`,
    'ts/no-namespace': `off`,
    'ts/ban-ts-comment': `off`,
  },
})
