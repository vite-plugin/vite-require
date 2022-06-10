import { join } from 'path'
import { defineConfig } from 'vite'
import { viteRequire } from '..'

export default defineConfig({
  root: __dirname,
  plugins: [
    viteRequire({
      extensions: ['.png', '.svg'],
    }),
  ],
  resolve: {
    alias: {
      '@': join(__dirname, 'src'),
    },
  },
})
