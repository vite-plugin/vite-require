import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import { viteRequire } from '..'

export default defineConfig({
  root: __dirname,
  plugins: [
    viteRequire({
      extensions: ['.png', '.svg'],
    }),
    {
      name: 'vite-require:test',
      transform(code, id) {
        if (id.endsWith('src/main.ts')) {
          // Write transformed code to output.js
          fs.writeFileSync(path.join(path.dirname(id), 'main-output.js'), code)
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
})
