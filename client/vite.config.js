import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Workout & Meal Tracker",
        short_name: "Tracker",
        description: "Track workouts, meals, and calories — with an AI assistant.",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        icons: [
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
