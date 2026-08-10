import type { Theme } from 'vitepress'
import Callout from './components/Callout.vue'
import ComponentCardGrid from './components/ComponentCardGrid.vue'
import ComponentPreview from './components/ComponentPreview.vue'
import Layout from './Layout.vue'
import './styles/docs-tokens.css'
import './styles/chrome.css'
import './styles/prose.css'
import './styles/scenes.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('Callout', Callout)
    app.component('ComponentPreview', ComponentPreview)
    app.component('ComponentCardGrid', ComponentCardGrid)
  },
} satisfies Theme
