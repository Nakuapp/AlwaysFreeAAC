import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL ?? "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/app-icon-192.png", "icons/app-icon-512.png"],
      manifest: {
        name: "AlwaysFreeAAC",
        short_name: "AAC",
        description: "A free, accessible AAC app for mobile, tablet, and desktop",
        theme_color: "#005fcc",
        background_color: "#f5f5f5",
        display: "standalone",
        orientation: "any",
        lang: "en",
        icons: [
          {
            src: "icons/app-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/app-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/app-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        runtimeCaching: [
          {
            // Board media ships in the build but is cached on demand to keep
            // the precache small.
            urlPattern: /\/boards\/media\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "board-media-cache",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
