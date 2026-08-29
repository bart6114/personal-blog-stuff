import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", site ?? "https://barts.space").href}\n`, {
  headers: { "content-type": "text/plain; charset=utf-8" }
});
