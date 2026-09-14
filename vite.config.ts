import { type Plugin, defineConfig } from "vite";

import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { URL, fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

import pkg from "./package.json";

function urlCheckPlugin(): Plugin {
  return {
    name: "url-check-api",
    configureServer(server) {
      server.middlewares.use("/app/check-url", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: "Method not allowed" }));
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        req.on("end", async () => {
          try {
            const { url } = JSON.parse(body);

            const targetRes = await fetch(url, { method: "HEAD" });

            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ reachable: targetRes.ok }));
          } catch {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ reachable: false }));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: "/",
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "app-assets/[name]-[hash][extname]",
          chunkFileNames: "app-assets/[name]-[hash].js",
          entryFileNames: "app-assets/[name]-[hash].js",
        },
      },
    },
    plugins: [
      devtools(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: false,
      }),
      viteReact(),
      tailwindcss(),
      urlCheckPlugin(),
      VitePWA({
        disable: mode === "development",
        devOptions: {
          enabled: mode !== "development",
          type: "module",
        },
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.ts",
        registerType: "autoUpdate",
        injectManifest: {
          globPatterns: ["**/*.{css,html,js,json,webmanifest,ico,png,svg,otf,ttf,woff,woff2}"],
          globDirectory: "dist",
          swDest: "dist/sw.js",
        },
        manifest: {
          short_name: "EchoLink",
          name: "EchoLink",
          description: "Self-hosted client app for Linkding.",
          start_url: ".",
          display: "standalone",
          theme_color: "#15ba81",
          background_color: "#0a0a0a",
          icons: [
            {
              src: "favicon.svg",
              sizes: "128x128 64x64 48x48 32x32 24x24 16x16",
              type: "image/svg+xml",
            },
            {
              src: "pwa-64x64.png",
              type: "image/png",
              sizes: "64x64",
            },
            {
              src: "pwa-192x192.png",
              type: "image/png",
              sizes: "192x192",
            },
            {
              src: "pwa-512x512.png",
              type: "image/png",
              sizes: "512x512",
            },
            {
              src: "maskable-icon-512x512.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        "^/(api|assets|favicons|media|previews|static)": {
          target: "http://127.0.0.1:9090",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
