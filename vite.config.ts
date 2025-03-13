import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/auth/v1': {
        target: 'https://xvqehnzepfjruquiozvs.supabase.co',
        changeOrigin: true,
        secure: false
      },
      '/rest/v1': {
        target: 'https://xvqehnzepfjruquiozvs.supabase.co',
        changeOrigin: true,
        secure: false
      }
    }
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}); 