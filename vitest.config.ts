import type { BrowserCommand } from 'vitest/node'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

interface Point {
  x: number
  y: number
}

const mouseDown: BrowserCommand<[at: Point]> = async (ctx, at) => {
  await ctx.page.mouse.move(at.x, at.y)
  await ctx.page.mouse.down()
}

const mouseMove: BrowserCommand<[from: Point, to: Point]> = async (
  ctx,
  from,
  to,
) => {
  const steps = 5
  for (let index = 1; index <= steps; index++) {
    await ctx.page.mouse.move(
      from.x + ((to.x - from.x) * index) / steps,
      from.y + ((to.y - from.y) * index) / steps,
    )
  }
}

const mouseUp: BrowserCommand<[at?: Point]> = async (ctx, at) => {
  if (at)
    await ctx.page.mouse.move(at.x, at.y)
  await ctx.page.mouse.up()
}

const keyPress: BrowserCommand<[key: string]> = async (ctx, key) => {
  await ctx.page.keyboard.press(key)
}

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['packages/*/test/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'packages/*/test/browser/**'],
        },
      },
      {
        extends: true,
        // @testing-library/vue reads process.env at import time; there is
        // no Node globals shim in the real browser.
        define: { 'process.env': '{}' },
        test: {
          name: 'browser',
          include: ['packages/*/test/browser/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
            commands: { mouseDown, mouseMove, mouseUp, keyPress },
          },
        },
      },
    ],
  },
})
