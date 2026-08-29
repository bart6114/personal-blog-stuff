import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://barts.space",
  devToolbar: { enabled: false },
  srcDir: "./app",
  publicDir: "./public",
  outDir: "./dist",
  trailingSlash: "always",
  markdown: {
    processor: satteri({
      features: {
        gfm: false,
        smartPunctuation: false
      }
    })
  },
  build: {
    format: "directory"
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/blog/") && !page.endsWith("/subscribe/")
    })
  ]
});
