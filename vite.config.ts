import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins, type Plugin } from "vite-plus";

const siteDataPath = fileURLToPath(new URL("./src/data/site.json", import.meta.url));

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

function siteMeta(): Plugin {
  return {
    name: "site-meta",
    configureServer(server) {
      server.watcher.add(siteDataPath);
    },
    transformIndexHtml(html) {
      const site = JSON.parse(readFileSync(siteDataPath, "utf8"));
      return html.replace(/%site\.([\w.]+)%/g, (match, path: string) => {
        const value = path
          .split(".")
          .reduce<unknown>(
            (node, key) =>
              node && typeof node === "object" ? (node as Record<string, unknown>)[key] : undefined,
            site,
          );
        return typeof value === "string" ? escapeHtml(value) : match;
      });
    },
  };
}

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    plugins: ["react", "typescript", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/only-export-components": ["warn", { allowConstantExport: true }],
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
  },
  base: process.env.BASE_PATH ?? "/",
  resolve: {
    alias: {
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@data": fileURLToPath(new URL("./src/data", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: lazyPlugins(() => [siteMeta(), react(), tailwindcss()]),
  build: { chunkSizeWarningLimit: 1000 },
});
