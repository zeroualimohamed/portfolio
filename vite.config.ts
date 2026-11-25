import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Emits classic non-module IIFE bundle + local stylesheet in dist/index.html
 * so double-clicking index.html from Windows Explorer (file://) opens the
 * complete React 19 + Motion + ASCII Canvas portfolio without CORS blocks.
 */
function fileProtocolCompat(): Plugin {
  return {
    name: "file-protocol-compat",
    apply: "build",
    enforce: "post",
    transformIndexHtml(html) {
      let out = html
        .replace(/<!--DEV_FILE_REDIRECT_START-->[\s\S]*?<!--DEV_FILE_REDIRECT_END-->\s*/g, "")
        .replace(/<link rel="stylesheet" crossorigin href="(\.\/assets\/[^"]+)">/g, '<link rel="stylesheet" href="$1">');

      const scriptMatch = out.match(/<script type="module" crossorigin src="(\.\/assets\/[^"]+)"><\/script>/);
      if (scriptMatch) {
        out = out.replace(scriptMatch[0], "");
        out = out.replace("</body>", `  <script defer src="${scriptMatch[1]}"></script>\n  </body>`);
      }
      return out;
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), fileProtocolCompat()],
  build: {
    target: "es2022",
    sourcemap: false,
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: "iife",
        inlineDynamicImports: true,
        entryFileNames: "assets/app.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
