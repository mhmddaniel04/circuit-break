/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { devApiPlugin } from './server/devApiPlugin';

export default defineConfig({
  plugins: [react(), devApiPlugin()],
  resolve: {
    // Allows imports like '@/pages/Home/HomePage' instead of '../../../'
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    // Playwright runs the browser tests in tests/e2e, not Vitest.
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
