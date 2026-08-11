import type { EnhanceAppContext, Theme } from 'vitepress'
import { watch } from 'vue'
import Callout from './components/Callout.vue'
import ComponentCardGrid from './components/ComponentCardGrid.vue'
import ComponentPreview from './components/ComponentPreview.vue'
import Layout from './Layout.vue'
import './styles/docs-tokens.css'
import './styles/chrome.css'
import './styles/prose.css'
import './styles/scenes.css'

const GA_TAG_ID = 'G-DVKQNQHWQ1'

// VitePress is a SPA: the tag only counts the first load on its own, so route
// changes are reported by hand. Loaded lazily, never during SSR, and never in
// dev — local page views would otherwise land in the production property.
function initGtag(context: EnhanceAppContext) {
  if (import.meta.env.SSR || !import.meta.env.PROD)
    return

  import('vue-gtag').then(({ configure, pageview }) => {
    configure({ tagId: GA_TAG_ID })

    watch(
      () => context.router.route.path,
      path => pageview(path),
    )
  })
}

export default {
  Layout,
  enhanceApp(context) {
    const { app } = context
    app.component('Callout', Callout)
    app.component('ComponentPreview', ComponentPreview)
    app.component('ComponentCardGrid', ComponentCardGrid)
    initGtag(context)
  },
} satisfies Theme
