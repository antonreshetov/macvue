import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'macvue',
  description: 'macOS UI components for Vue',
  cleanUrls: true,
  head: [
    // VitePress's own FOUC-prevention script only toggles the `.dark` class
    // and ignores appearance.attribute, so restore our attribute before
    // first paint.
    [
      'script',
      {},
      `;(() => {
  let saved = 'auto'
  try {
    saved = localStorage.getItem('vitepress-theme-appearance') || 'auto'
  }
  catch {}
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = saved === 'dark' || (saved !== 'light' && prefersDark)
  document.documentElement.dataset.macvueAppearance = dark ? 'dark' : 'light'
})()`,
    ],
  ],
  appearance: {
    attribute: 'data-macvue-appearance',
    valueDark: 'dark',
    valueLight: 'light',
  },
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/introduction' },
      { text: 'Components', link: '/components/button' },
      { text: 'GitHub', link: 'https://github.com/antonreshetov/macvue' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Installation', link: '/installation' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Checkbox', link: '/components/checkbox' },
          { text: 'Radio Group', link: '/components/radio-group' },
          { text: 'Switch', link: '/components/switch' },
        ],
      },
    ],
  },
  vite: {
    resolve: {
      alias: {
        // Resolve macvue straight to sources so docs pick up edits without
        // a prior `pnpm build`.
        'macvue/style.css': fileURLToPath(
          new URL('../../packages/core/src/styles/index.css', import.meta.url),
        ),
        'macvue': fileURLToPath(
          new URL('../../packages/core/src/index.ts', import.meta.url),
        ),
      },
      dedupe: ['vue'],
    },
  },
})
