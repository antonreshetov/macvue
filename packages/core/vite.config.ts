import { readFileSync } from 'node:fs'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const { version } = JSON.parse(
  readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf8'),
)

export default defineConfig({
  // Stamped at build time so the exported version can never drift from the
  // manifest bumpy updates. Dev servers alias macvue to the sources, where
  // this is undefined — index.ts falls back there.
  define: {
    __MACVUE_VERSION__: JSON.stringify(version),
  },
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.json',
      cleanVueFileName: true,
      // tokens.gen.ts is bundled into index.js, so a standalone tokens.gen.d.ts
      // would advertise a module path with no runtime behind it.
      exclude: ['**/*.gen.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', 'reka-ui'],
    },
  },
})
