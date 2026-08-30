import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: `jsdom`,
    include: [`src/**/*.test.ts`],
    benchmark: {
      include: [`bench/**/*.bench.ts`],
    },
  },
})
