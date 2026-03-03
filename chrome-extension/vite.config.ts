import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "fs";

function copyStaticAssets(): import("vite").Plugin {
  return {
    name: "copy-static-assets",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
      copyFileSync(
        resolve(__dirname, "public/manifest.json"),
        resolve(dist, "manifest.json")
      );
      const imgSrc = resolve(__dirname, "public/images");
      const imgDst = resolve(dist, "images");
      if (existsSync(imgSrc)) cpSync(imgSrc, imgDst, { recursive: true });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  return {
    plugins: [react(), copyStaticAssets()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: isDev,
      minify: !isDev,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, "src/popup/index.html"),
          content: resolve(__dirname, "src/content/index.ts"),
          background: resolve(__dirname, "src/background/index.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    resolve: {
      alias: { "@": resolve(__dirname, "src") },
    },
  } satisfies UserConfig;
});
