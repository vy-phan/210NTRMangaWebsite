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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Manga Reader Offline',
        short_name: 'MangaApp',
        description: 'Đọc truyện tranh offline',
        theme_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',

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

            if (id.includes('@supabase')) {
              return 'supabase';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});