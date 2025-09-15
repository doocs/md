import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': `./src/index.ts`,
    'renderer/index': `./src/renderer/index.ts`,
    'extensions/index': `./src/extensions/index.ts`,
    'utils/index': `./src/utils/index.ts`,
  },
  dts: true,
  format: [`esm`, `cjs`],
  platform: `neutral`,
})
