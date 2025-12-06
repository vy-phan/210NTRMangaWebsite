import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Tăng giới hạn cảnh báo lên (để đỡ bị spam warning)
    chunkSizeWarningLimit: 1600, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Tách riêng Recharts (vì nó rất nặng và chỉ dùng ở Admin)
            if (id.includes('recharts')) {
              return 'recharts';
            }
            
            // 2. Tách riêng Supabase (nếu thư viện này lớn)
            if (id.includes('@supabase')) {
              return 'supabase';
            }

            // 3. QUAN TRỌNG: Tất cả các thư viện còn lại (React, Router, DaisyUI...)
            // gom chung vào 1 file 'vendor' để đảm bảo tính toàn vẹn và thứ tự load.
            return 'vendor';
          }
        },
      },
    },
  },
});