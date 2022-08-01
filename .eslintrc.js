module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [`plugin:vue/essential`, `eslint:recommended`, `@vue/prettier`],
  parserOptions: {
    parser: `babel-eslint`,
  },
  ignorePatterns: [`src/assets/scripts/renderers`],
  rules: {
    'prettier/prettier': [
      `error`,
      {
        singleQuote: true,
        semi: false,
      },
    ],
    semi: [`error`, `never`],
    quotes: [`error`, `backtick`],
    'no-unused-vars': `off`,
    'no-console': `off`,
    'no-debugger': `off`,
  },
}
