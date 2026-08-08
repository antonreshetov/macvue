import type { Theme } from 'vitepress'
import ComponentPreview from './components/ComponentPreview.vue'
import Layout from './Layout.vue'
import './styles/theme.css'

export default {
  Layout,
  enhanceApp({ app }) {
    app.component('ComponentPreview', ComponentPreview)
  },
} satisfies Theme
