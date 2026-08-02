import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const localConfigPath = fileURLToPath(
  new URL("./config/config.local.js", import.meta.url),
);
const prodConfigPath = fileURLToPath(
  new URL("./config/config.prod.js", import.meta.url),
);

// Serves config/config.local.js as /config.js in dev, and bakes
// config/config.prod.js into /config.js on every `vite build`.
function envConfig(): Plugin {
  return {
    name: "env-config",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/config.js") {
          res.setHeader("Content-Type", "text/javascript");
          res.end(readFileSync(localConfigPath));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "config.js",
        source: readFileSync(prodConfigPath, "utf-8"),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    envConfig(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  define: {
    global: "window",
  },
});
