import { defineConfig } from 'vitest/config'
import path from 'path'

const resolve = (...paths: string[]) => path.resolve(__dirname, ...paths)

// Config for global monorepo unit-testing
export default defineConfig({
  resolve: {
    alias: {
      '@iroha2/i64-fixnum': resolve('./packages/i64-fixnum/src/lib.ts'),
    },
  },
  test: {
    include: ['**/*.spec.ts'],
    exclude: ['packages/client/test/integration', '**/node_modules', '**/dist', '**/dist-tsc'],
    includeSource: ['packages/i64-fixnum/src/**/*.ts', 'packages/client/src/**/*.ts'],
  },
})
