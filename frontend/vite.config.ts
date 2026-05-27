import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5170,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favico.svg', 'logoLight.png', 'logoNight.png'],
      manifest: {
        name: '210 NTR Manga Offline',
        short_name: '210NTRManga',
        description: 'Đọc truyện tranh offline',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'logoLight.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logoLight.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logoLight.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'StaleWhileRevalidate', // Thay CacheFirst bằng StaleWhileRevalidate để linh hoạt hơn khi lỗi mạng

            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 5000, // Lưu tối đa 5000 ảnh
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 ngày
              },
              // QUAN TRỌNG NHẤT:
              // status 0: Là ảnh từ domain khác bị CORS (Opaque Response)
              // status 200: Là ảnh bình thường
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) {
              return 'recharts';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});