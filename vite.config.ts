import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Log configuration
console.log("📋 Loading Vite configuration");
console.log("📊 Node environment:", process.env.NODE_ENV);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Log server startup
    hmr: {
      overlay: true,
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Log build warnings
        console.log("⚠️ Build warning:", warning);
        warn(warning);
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
  },
  define: {
    // Ensure React is properly defined
    'process.env': {},
  },
});