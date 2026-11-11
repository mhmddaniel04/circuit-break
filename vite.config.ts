/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { devApiPlugin } from './server/devApiPlugin';

export default defineConfig({
  plugins: [
    react(),
    devApiPlugin(),
    // Makes the game installable on phones and playable offline (AI hints still need internet).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Circuit Break: Logic Gate Puzzle Game',
        short_name: 'Circuit Break',
        description: 'A logic gate puzzle game for Form 5 students.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#e0662a',
        background_color: '#e0662a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // Never cache the AI hint API: hints must always be fresh.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Keep the Google Fonts so the game looks right offline.
            urlPattern: ({ url }) =>
              url.origin === 'https://fonts.googleapis.com' ||
              url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
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
