import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const docsDir = dirname(fileURLToPath(new URL('.', import.meta.url)))

// A page's own summary beats one shared description repeated 24 times. The
// lead paragraph of every page already is that summary, so it is reused
// verbatim with inline markdown stripped.
function leadParagraph(relativePath: string) {
  let source: string
  try {
    source = readFileSync(join(docsDir, relativePath), 'utf8')
  }
  catch {
    return
  }

  const body = source.replace(/^---\n[\s\S]*?\n---\n/, '')
  const paragraph = body
    .split('\n\n')
    .map(block => block.trim())
    .find(block => block && !/^[#<:`|-]/.test(block))
  if (!paragraph)
    return

  const text = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text
}

const site = 'https://macvue.dev'
const description = 'macOS UI components for Vue'

export default defineConfig({
  title: 'MacVue',
  description,
  cleanUrls: true,
  sitemap: { hostname: site },
  head: [
    // Social previews need absolute URLs, so the image is pinned to the site
    // origin rather than resolved against the current page.
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'MacVue' }],
    ['meta', { property: 'og:image', content: `${site}/og.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    [
      'meta',
      {
        property: 'og:image:alt',
        content: 'macOS-inspired controls. Built for Vue.',
      },
    ],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: `${site}/og.png` }],
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
  // Canonical, og:url and the social title are per page: a shared value would
  // make every shared link point at the home page.
  transformPageData(pageData) {
    const path = pageData.relativePath
      .replace(/(^|\/)index\.md$/, '$1')
      .replace(/\.md$/, '')
    const canonical = `${site}/${path}`
    const title
      = pageData.frontmatter.layout === 'home' || !pageData.title
        ? 'MacVue — macOS-inspired controls for Vue'
        : `${pageData.title} | MacVue`
    const pageDescription
      = pageData.frontmatter.description
        || leadParagraph(pageData.relativePath)
        || description

    // VitePress renders <meta name="description"> from pageData.description,
    // so a head entry here would be dropped as a duplicate.
    pageData.description = pageDescription

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
    )
  },
  appearance: {
    attribute: 'data-macvue-appearance',
    valueDark: 'dark',
    valueLight: 'light',
  },
  themeConfig: {
    nav: [
      { text: 'Docs', link: '/introduction' },
      { text: 'Components', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/antonreshetov/macvue' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Installation', link: '/installation' },
          { text: 'Liquid Glass', link: '/liquid-glass' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Overview', link: '/components/' },
          { text: 'Badge', link: '/components/badge' },
          { text: 'Box', link: '/components/box' },
          { text: 'Button', link: '/components/button' },
          { text: 'Checkbox', link: '/components/checkbox' },
          { text: 'Glass Panel', link: '/components/glass-panel' },
          { text: 'Help Button', link: '/components/help-button' },
          { text: 'Label', link: '/components/label' },
          { text: 'Pop-Up Button', link: '/components/pop-up-button' },
          { text: 'Progress', link: '/components/progress' },
          { text: 'Radio Group', link: '/components/radio-group' },
          { text: 'Search Field', link: '/components/search-field' },
          { text: 'Secure Field', link: '/components/secure-field' },
          { text: 'Segmented Control', link: '/components/segmented-control' },
          { text: 'Separator', link: '/components/separator' },
          { text: 'Slider', link: '/components/slider' },
          { text: 'Spinner', link: '/components/spinner' },
          { text: 'Stepper', link: '/components/stepper' },
          { text: 'Switch', link: '/components/switch' },
          { text: 'Text Field', link: '/components/text-field' },
        ],
      },
    ],
  },
  vite: {
    resolve: {
      alias: {
        // Resolve macvue straight to sources so docs pick up edits without
        // a prior `pnpm build`.
        '@macvue/core/style.css': fileURLToPath(
          new URL('../../packages/core/src/styles/index.css', import.meta.url),
        ),
        '@macvue/core': fileURLToPath(
          new URL('../../packages/core/src/index.ts', import.meta.url),
        ),
      },
      dedupe: ['vue'],
    },
  },
})
