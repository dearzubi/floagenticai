/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import dotenv from "dotenv";

const serverEnv = dotenv.config({
  processEnv: {},
  path: "../backend/.env",
}).parsed;

const serverPort = Number(serverEnv?.PORT) || 4000;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      "/api": {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true,
      },
      "/assets": {
        target: `http://localhost:${serverPort}`,
        changeOrigin: true,
      },
      "/socket.io": {
        target: `http://localhost:${serverPort}`,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true, // Allows you to use Vitest's APIs (describe, it, expect, etc.) globally without importing them
    setupFiles: "./test/setup.ts",
    css: true,
  },
});
