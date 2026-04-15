import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { dynamicManifestPlugin } from "./vite-plugins/dynamic-manifest";
import { getAppManifest } from "./pwa/manifest";

export default defineConfig(({ mode }) => {
  const BASE = mode === "gh-pages" ? "/chilisten/" : "/";

  return {
    base: BASE,
    plugins: [
      react(),
      tailwindcss(),
      dynamicManifestPlugin(getAppManifest(BASE), "manifest.json"),
    ],
    define: {
      __BUILD_TIMESTAMP__: `"${new Date().toISOString()}"`,
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: "./index.html",
          sw: "./pwa/service-worker.ts",
        },
        output: {
          entryFileNames(chunkInfo) {
            if (chunkInfo.name === "sw") return "sw.js";
            return "assets/[name]-[hash].js";
          },
        },
      },
    },
  };
});
