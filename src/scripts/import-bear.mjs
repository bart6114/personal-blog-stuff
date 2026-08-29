import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import gfmPlugin from "turndown-plugin-gfm";

const { gfm } = gfmPlugin;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = dirname(scriptDir);
const repoDir = dirname(projectDir);
const blogDir = join(repoDir, "content", "blog");
const publicDir = join(projectDir, "public");
const cacheDir = join(projectDir, ".migration-cache");
const manifestPath = join(scriptDir, "bear-import-manifest.json");
const origin = "https://barts.space";
const userAgent = "Mozilla/5.0 (compatible; barts.space Astro migration; +https://barts.space/)";
const refresh = process.env.BEAR_REFRESH === "1";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchBuffer(url, accept, cacheType = "html") {
  const cachePath = join(cacheDir, cacheType, `${sha256(url)}.bin`);
  if (!refresh) {
    try {
      return await readFile(cachePath);
    } catch {
      // Cache miss.
    }
  }

  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": userAgent, accept },
        signal: AbortSignal.timeout(60_000)
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!buffer.length) throw new Error("empty response");
      await mkdir(dirname(cachePath), { recursive: true });
      await writeFile(cachePath, buffer);
      await sleep(450);
      return buffer;
    } catch (error) {
      lastError = error;
      if (attempt < 4) await sleep(2 ** attempt * 1_000);
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? lastError}`);
}

async function fetchHtml(url) {
  return (await fetchBuffer(url, "text/html,application/xhtml+xml", "html")).toString("utf8");
}

function archiveEntries(html) {
  const $ = cheerio.load(html);
  const entries = [];
  $("ul.blog-posts > li").each((_, element) => {
    const link = $(element).find("a[href]").first();
    const href = link.attr("href");
    const datetime = $(element).find("time[datetime]").attr("datetime");
    if (!href || !datetime || !href.startsWith("/")) return;
    entries.push({
      sourceUrl: new URL(href, origin).href,
      slug: href.replace(/^\/+|\/+$/g, ""),
      publishedAt: new Date(datetime).toISOString()
    });
  });
  return entries;
}

function sitemapUpdates(html) {
  const $ = cheerio.load(html, { xmlMode: true });
  const updates = new Map();
  $("url").each((_, element) => {
    const location = $(element).find("loc").first().text().trim();
    const lastmod = $(element).find("lastmod").first().text().trim();
    if (!location || !lastmod) return;
    const slug = new URL(location).pathname.replace(/^\/+|\/+$/g, "");
    if (slug) updates.set(slug, new Date(lastmod).toISOString());
  });
  return updates;
}

function semanticText(root) {
  const copy = root.clone();
  copy.find("br,p,h1,h2,h3,h4,h5,h6,li,blockquote,pre,hr,div,figure,figcaption").prepend(" ");
  return copy.text().replace(/\s+/g, " ").trim();
}

function safeAssetName(url, contentType) {
  let name;
  try {
    name = decodeURIComponent(basename(new URL(url).pathname));
  } catch {
    name = "asset";
  }
  name = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  const extensions = {
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/svg+xml": ".svg",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm"
  };
  if (!extname(name)) name += extensions[contentType] ?? ".bin";
  return name || `asset-${sha256(url).slice(0, 12)}${extensions[contentType] ?? ".bin"}`;
}

async function mirrorAsset(url, slug, usedNames) {
  const buffer = await fetchBuffer(url, "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.9,*/*;q=0.1", "assets");
  const cachedPath = join(cacheDir, "assets", `${sha256(url)}.bin`);
  const responseMetaPath = `${cachedPath}.json`;
  let contentType = "";

  try {
    contentType = JSON.parse(await readFile(responseMetaPath, "utf8")).contentType;
  } catch {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "user-agent": userAgent },
      signal: AbortSignal.timeout(30_000)
    });
    contentType = (response.headers.get("content-type") ?? "").split(";")[0];
    await writeFile(responseMetaPath, JSON.stringify({ contentType }, null, 2));
  }

  let name = safeAssetName(url, contentType);
  if (usedNames.has(name) && usedNames.get(name) !== url) {
    name = `${name.replace(/(\.[^.]+)$/, "")}-${sha256(url).slice(0, 8)}${extname(name)}`;
  }
  usedNames.set(name, url);
  const relativePath = join("media", slug, name);
  const outputPath = join(publicDir, relativePath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
  const outputStats = await stat(outputPath);
  if (!outputStats.size) throw new Error(`Downloaded empty media file: ${url}`);
  return { sourceUrl: url, localPath: `/${relativePath.split("\\").join("/")}`, sha256: sha256(buffer), bytes: outputStats.size, contentType };
}

async function rewriteMedia($, main, slug) {
  const media = [];
  const usedNames = new Map();
  const nodes = main.find("img[src], source[src], video[poster]").toArray();
  for (const node of nodes) {
    const element = $(node);
    const attribute = element.is("video") ? "poster" : "src";
    const raw = element.attr(attribute);
    if (!raw) continue;
    const url = new URL(raw, origin);
    const shouldMirror = url.hostname === "bear-images.sfo2.cdn.digitaloceanspaces.com" || url.hostname === "barts.space";
    if (!shouldMirror) continue;
    const mirrored = await mirrorAsset(url.href, slug, usedNames);
    element.attr(attribute, mirrored.localPath);
    media.push(mirrored);
  }
  return media;
}

function yamlString(value) {
  return JSON.stringify(value.replace(/\s+/g, " ").trim());
}

function createMarkdown(metadata, body) {
  const tags = metadata.tags.length
    ? `tags:\n${metadata.tags.map((tag) => `  - ${yamlString(tag)}`).join("\n")}`
    : "tags: []";
  const image = metadata.image ? `\nimage: ${yamlString(metadata.image)}` : "";
  return `---\ntitle: ${yamlString(metadata.title)}\ndescription: ${yamlString(metadata.description)}\npublishedAt: ${yamlString(metadata.publishedAt)}\nupdatedAt: ${yamlString(metadata.updatedAt)}\nslug: ${yamlString(metadata.slug)}\ndraft: false\n${tags}${image}\n---\n\n${body.trim()}\n`;
}

async function parsePost(entry) {
  const html = await fetchHtml(entry.sourceUrl);
  const $ = cheerio.load(html, { decodeEntities: false });
  const main = $("main").first();
  if (!main.length) throw new Error(`No <main> found at ${entry.sourceUrl}`);

  const canonical = $("link[rel=canonical]").attr("href") ?? entry.sourceUrl;
  const title = $("meta[name=title]").attr("content")?.trim() || main.children("h1").first().text().trim();
  const description = $("meta[name=description]").attr("content")?.trim() || "";
  const datetime = main.find("time[datetime]").first().attr("datetime") ?? entry.publishedAt;
  const tags = main.find(".tags a").toArray().map((node) => $(node).text().replace(/^#/, "").trim()).filter(Boolean);

  const upvote = main.find("#upvote-form").first();
  if (upvote.length) {
    upvote.nextAll().remove();
    upvote.remove();
  }
  main.find("script, form, input, button, .tags").remove();
  main.children("h1").first().remove();
  main.find("time[datetime]").first().closest("p").remove();

  const media = await rewriteMedia($, main, entry.slug);
  const bodyHtml = main.html()?.trim() ?? "";
  if (!title || !bodyHtml) throw new Error(`Missing title or body at ${entry.sourceUrl}`);

  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**"
  });
  turndown.use(gfm);
  turndown.addRule("fencedPre", {
    filter: (node) => node.nodeName === "PRE",
    replacement: (_content, node) => `\n\n\`\`\`\n${node.textContent.trim()}\n\`\`\`\n\n`
  });
  turndown.keep(["sub", "sup", "iframe", "video", "source", "figure", "figcaption"]);
  const body = turndown.turndown(bodyHtml).replace(/\n{3,}/g, "\n\n");
  const metadata = {
    title,
    description,
    publishedAt: new Date(datetime).toISOString(),
    updatedAt: entry.updatedAt ?? new Date(datetime).toISOString(),
    slug: entry.slug,
    tags,
    image: media.find((asset) => asset.contentType.startsWith("image/"))?.localPath
  };

  await writeFile(join(blogDir, `${entry.slug}.md`), createMarkdown(metadata, body));
  return {
    ...entry,
    canonical,
    title,
    publishedAt: metadata.publishedAt,
    updatedAt: metadata.updatedAt,
    sourceHtmlSha256: sha256(html),
    normalizedBodySha256: sha256(bodyHtml.replace(/\s+/g, " ").trim()),
    semanticTextSha256: sha256(semanticText(main)),
    structure: {
      headings: main.find("h2,h3,h4,h5,h6").toArray().map((node) => ({ level: node.tagName, text: $(node).text().replace(/\s+/g, " ").trim() })),
      links: main.find("a").toArray().map((node) => ({ text: $(node).text().replace(/\s+/g, " ").trim(), href: $(node).attr("href") ?? "" })),
      images: main.find("img").toArray().map((node) => ({ alt: $(node).attr("alt") ?? "", src: $(node).attr("src") ?? "" })),
      blockquotes: main.find("blockquote").length,
      codeBlocks: main.find("pre").length,
      listItems: main.find("li").length
    },
    media
  };
}

async function main() {
  await mkdir(blogDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  const archiveUrl = `${origin}/blog/`;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const archiveHtml = await fetchHtml(archiveUrl);
  const sitemapHtml = await fetchHtml(sitemapUrl);
  const updates = sitemapUpdates(sitemapHtml);
  const entries = archiveEntries(archiveHtml).map((entry) => ({ ...entry, updatedAt: updates.get(entry.slug) ?? entry.publishedAt }));
  if (!entries.length) throw new Error("No published posts found in the live archive");

  let previousGenerated = [];
  try {
    previousGenerated = JSON.parse(await readFile(manifestPath, "utf8")).posts.map((post) => post.slug);
  } catch {
    // First import.
  }
  const currentSlugs = new Set(entries.map((entry) => entry.slug));
  for (const slug of previousGenerated) {
    if (!currentSlugs.has(slug)) await rm(join(blogDir, `${slug}.md`), { force: true });
  }
  await rm(join(blogDir, ".gitkeep"), { force: true });

  const posts = [];
  for (const [index, entry] of entries.entries()) {
    process.stdout.write(`[${index + 1}/${entries.length}] ${entry.slug}\n`);
    posts.push(await parsePost(entry));
  }

  const extraFiles = (await readdir(blogDir)).filter((name) => name.endsWith(".md") && !currentSlugs.has(name.replace(/\.md$/, "")));
  const unexpected = [];
  for (const name of extraFiles) {
    const source = await readFile(join(blogDir, name), "utf8");
    if (!/^draft:\s*true\s*$/m.test(source)) unexpected.push(name);
  }
  if (unexpected.length) throw new Error(`Unexpected Markdown files in content/blog: ${unexpected.join(", ")}`);

  const manifest = {
    source: archiveUrl,
    sitemapSource: sitemapUrl,
    fetchedAt: new Date().toISOString(),
    archiveSha256: sha256(archiveHtml),
    sitemapSha256: sha256(sitemapHtml),
    postCount: posts.length,
    posts
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Imported ${posts.length} posts and ${posts.reduce((total, post) => total + post.media.length, 0)} media references.\n`);
}

await main();
