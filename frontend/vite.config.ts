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
            handler: 'StaleWhileRevalidate',

            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 1000, // Giảm từ 5000 xuống 500 ảnh để không chiếm quá nhiều dung lượng
                maxAgeSeconds: 7 * 24 * 60 * 60, // Giảm từ 60 ngày xuống 7 ngày (1 tuần)
              },
              // Vẫn cache status 0 (opaque responses) để ảnh cross-origin vẫn offline được
              // Nhưng đã giảm maxEntries và maxAgeSeconds để kiểm soát dung lượng
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