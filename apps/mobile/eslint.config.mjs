// https://docs.expo.dev/guides/using-eslint/
import antfu from '@antfu/eslint-config'
import expoPlugin from 'eslint-config-expo'
import { globalIgnores } from 'eslint/config'

export default antfu(
  {
    react: true,
    type: 'app',
    pnpm: false,
  },
  globalIgnores(['dist/*', 'android/', 'ios/', '.expo/', '.expo-shared']),
  {
    plugins: {
      expo: expoPlugin,
    },
    rules: {
      'ts/no-use-before-define': 'off',
      'ts/no-require-imports': 'off',
      'node/prefer-global/process': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
)
