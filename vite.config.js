import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Keep the output directory expected by Firebase Hosting.
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.js'],
    server: {
      // Transform the spinner's ESM/CommonJS boundary through Vite in tests too.
      deps: { inline: ['react-loader-spinner'] },
    },
  },
});
