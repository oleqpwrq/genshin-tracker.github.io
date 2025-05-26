import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
  base: '/genshin-tracker.github.io/',
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, '@images')
    }
  }
}) 