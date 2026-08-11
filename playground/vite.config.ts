import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Resolve macvue straight to sources so `pnpm play` picks up edits
      // with HMR and no prior `pnpm build`.
      '@macvue/core/style.css': path.resolve(
        import.meta.dirname,
        '../packages/core/src/styles/index.css',
      ),
      '@macvue/core': path.resolve(
        import.meta.dirname,
        '../packages/core/src/index.ts',
      ),
    },
  },
})
