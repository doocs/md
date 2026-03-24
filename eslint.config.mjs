import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  formatters: true,
  ignores: [`.github`, `scripts`, `docker`, `packages/md-cli`, `src/assets`, `example`],
}, {
  rules: {
    'semi': [`error`, `never`],
    'no-unused-vars': `off`,
    'no-console': `off`,
    'no-debugger': `off`,
    'e18e/prefer-array-at': `off`,
    'e18e/prefer-static-regex': `off`,
    'ts/no-namespace': `off`,
    'style/max-statements-per-line': `off`,
  },
})
