import { defineConfig } from "astro/config";
import llmsTxt from "@alexcarol/astro-llms-txt";
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
    llmsTxt({
      name: "barts.space",
      excludedPaths: ["404", "blog", "subscribe"]
    }),
    sitemap({
      filter: (page) => !page.endsWith("/blog/") && !page.endsWith("/subscribe/")
    })
  ]
});
