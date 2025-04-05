/// <reference types="vitest" />
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    ignore: ["**/@shoelace-style/shoelace/**/*"],
    environment: "jsdom",
  },
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      external: ["@zenfs/core/path.js"],
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "bookera",
        short_name: "bookera-2",
        description: "next gen ebooks",
        theme_color: "#ffb87e",
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
});
