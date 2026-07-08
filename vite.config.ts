import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` targets double-click/file:// usage, so everything is
// inlined into one index.html (chrome blocks module scripts over file://).
// `npm run build:pwa` keeps the normal multi-file PWA output with an
// installable service worker, for hosting on a real server/localhost.
export default defineConfig(({ mode }) => {
  const singleFileMode = mode !== 'pwa'

  return {
    base: singleFileMode ? './' : '/',
    build: {
      chunkSizeWarningLimit: 1200,
    },
    plugins: [
      react(),
      tailwindcss(),
      singleFileMode
        ? viteSingleFile()
        : VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg'],
            manifest: {
              name: '금형 정비 실적 관리',
              short_name: '금형정비실적',
              description: 'MOLD MAINTENANCE RECORD 주간 실적 보고 대시보드',
              theme_color: '#1e3a5f',
              background_color: '#f4f6f8',
              display: 'standalone',
              start_url: '/',
              icons: [
                { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
                { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
              maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            },
          }),
    ],
  }
})
