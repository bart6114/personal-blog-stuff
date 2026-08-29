import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { parse as parseYaml } from "yaml";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = dirname(scriptDir);
const repoDir = dirname(projectDir);
const blogDir = join(repoDir, "content", "blog");
const scratchpadDir = join(repoDir, "content", "scratchpad");
const distDir = join(projectDir, "dist");
const manifest = JSON.parse(await readFile(join(scriptDir, "bear-import-manifest.json"), "utf8"));
const homepagePostLimit = 8;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const semanticText = (root) => {
  const copy = root.clone();
  copy.find("br,p,h1,h2,h3,h4,h5,h6,li,blockquote,pre,hr,div,figure,figcaption").prepend(" ");
  return copy.text().replace(/\s+/g, " ").trim();
};
const structureSnapshot = (root, $) => ({
  headings: root.find("h2,h3,h4,h5,h6").toArray().map((node) => ({ level: node.tagName, text: $(node).text().replace(/\s+/g, " ").trim() })),
  links: root.find("a").toArray().map((node) => ({ text: $(node).text().replace(/\s+/g, " ").trim(), href: $(node).attr("href") ?? "" })),
  images: root.find("img").toArray().map((node) => ({ alt: $(node).attr("alt") ?? "", src: $(node).attr("src") ?? "" })),
  blockquotes: root.find("blockquote").length,
  codeBlocks: root.find("pre").length,
  listItems: root.find("li").length
});

function parseMarkdown(source, filename) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing YAML frontmatter`);
  return { data: parseYaml(match[1]), body: match[2] };
}

const blogFiles = (await readdir(blogDir)).filter((name) => name.endsWith(".md")).sort();
const scratchpadFiles = (await readdir(scratchpadDir)).filter((name) => name.endsWith(".md")).sort();
if (scratchpadFiles.length < 8) throw new Error(`Expected at least 8 scratchpad files, found ${scratchpadFiles.length}`);
if (!manifest.posts.length || manifest.postCount !== manifest.posts.length) throw new Error("Import manifest post count is invalid");

const slugs = new Set();
const publishedPosts = [];
const draftPosts = [];
for (const filename of blogFiles) {
  const source = await readFile(join(blogDir, filename), "utf8");
  const post = parseMarkdown(source, filename);
  const expectedSlug = filename.replace(/\.md$/, "");
  for (const key of ["title", "description", "publishedAt", "slug", "draft", "tags"]) {
    if (!(key in post.data)) throw new Error(`${filename}: missing ${key}`);
  }
  if (post.data.slug !== expectedSlug) throw new Error(`${filename}: slug does not match filename`);
  if (!Array.isArray(post.data.tags)) throw new Error(`${filename}: tags must be an array`);
  if (slugs.has(post.data.slug)) throw new Error(`${filename}: duplicate slug`);
  if (!post.body.trim()) throw new Error(`${filename}: empty body`);
  if (/bear-images\.sfo2\.cdn\.digitaloceanspaces\.com/.test(source)) throw new Error(`${filename}: Bear CDN reference remains`);
  slugs.add(post.data.slug);
  (post.data.draft ? draftPosts : publishedPosts).push(post);
}

for (const imported of manifest.posts) {
  if (!slugs.has(imported.slug)) throw new Error(`Manifest slug missing from content: ${imported.slug}`);
  const importedPost = publishedPosts.find((post) => post.data.slug === imported.slug);
  if (!importedPost) throw new Error(`Imported live post is marked draft: ${imported.slug}`);
  for (const media of imported.media) {
    const mediaPath = join(projectDir, "public", media.localPath.replace(/^\//, ""));
    const details = await stat(mediaPath);
    if (!details.size || details.size !== media.bytes) throw new Error(`Invalid media: ${media.localPath}`);
    if (sha256(await readFile(mediaPath)) !== media.sha256) throw new Error(`Media hash differs: ${media.localPath}`);
  }
}

let distExists = true;
try {
  await stat(distDir);
} catch {
  distExists = false;
}

if (distExists) {
  for (const post of publishedPosts) {
    await stat(join(distDir, post.data.slug, "index.html"));
  }
  for (const post of draftPosts) {
    try {
      await stat(join(distDir, post.data.slug));
      throw new Error(`Draft route leaked into dist: ${post.data.slug}`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  for (const imported of manifest.posts) {
    const builtPath = join(distDir, imported.slug, "index.html");
    await stat(builtPath);

    const built = cheerio.load(await readFile(builtPath, "utf8"), { decodeEntities: false });
    const builtBody = built(".article-body").first();
    const builtText = semanticText(builtBody);
    if (sha256(builtText) !== imported.semanticTextSha256) {
      throw new Error(`Rendered text differs from imported live source: ${imported.slug}`);
    }
    if (JSON.stringify(structureSnapshot(builtBody, built)) !== JSON.stringify(imported.structure)) {
      throw new Error(`Rendered structure differs from imported live source: ${imported.slug}`);
    }
    const importedPost = publishedPosts.find((post) => post.data.slug === imported.slug);
    if (built("link[rel=canonical]").attr("href") !== imported.sourceUrl) throw new Error(`Wrong canonical URL: ${imported.slug}`);
    if (built("meta[name=description]").attr("content") !== importedPost.data.description) throw new Error(`Wrong meta description: ${imported.slug}`);
    if (built("article h1").first().text().trim() !== importedPost.data.title) throw new Error(`Wrong article heading: ${imported.slug}`);
  }
  for (const slug of scratchpadFiles.map((name) => name.replace(/\.md$/, ""))) {
    try {
      await stat(join(distDir, slug));
      throw new Error(`Scratchpad route leaked into dist: ${slug}`);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  const home = cheerio.load(await readFile(join(distDir, "index.html"), "utf8"));
  const archive = cheerio.load(await readFile(join(distDir, "blog", "index.html"), "utf8"));
  if (home(".post-list li").length !== Math.min(homepagePostLimit, publishedPosts.length)) throw new Error("Homepage recent-post count is wrong");
  if (archive(".post-list li").length !== publishedPosts.length) throw new Error("Archive published-post count is wrong");
  if (home("main h1").length !== 1) throw new Error("Homepage must have exactly one main heading");
  if (home(".home-grid > .home-panel").length !== 3) throw new Error("Homepage panel structure is wrong");

  const sitemapXml = await readFile(join(distDir, "sitemap-0.xml"), "utf8");
  const sitemap = new XMLParser().parse(sitemapXml);
  const sitemapUrls = sitemap.urlset?.url ?? [];
  const expectedSitemapUrls = publishedPosts.length + 2;
  if (sitemapUrls.length !== expectedSitemapUrls) throw new Error(`Expected ${expectedSitemapUrls} sitemap URLs, found ${sitemapUrls.length}`);

  const atomPathCandidates = [join(distDir, "feed", "atom.xml")];
  let atomSource;
  for (const path of atomPathCandidates) {
    try {
      atomSource = await readFile(path, "utf8");
      break;
    } catch {
      // Try the next build shape.
    }
  }
  if (!atomSource) throw new Error("Atom feed output missing");
  const atom = new XMLParser({ ignoreAttributes: false }).parse(atomSource);
  const atomEntries = atom.feed?.entry ?? [];
  const expectedFeedEntries = Math.min(10, publishedPosts.length);
  if (atomEntries.length !== expectedFeedEntries) throw new Error(`Expected ${expectedFeedEntries} Atom entries, found ${atomEntries.length}`);

  const rss = new XMLParser().parse(await readFile(join(distDir, "rss.xml"), "utf8"));
  const rssItems = rss.rss?.channel?.item ?? [];
  if (rssItems.length !== expectedFeedEntries) throw new Error(`Expected ${expectedFeedEntries} RSS entries, found ${rssItems.length}`);

  const distFiles = await readdir(distDir, { recursive: true });
  for (const relative of distFiles.filter((name) => /\.(?:html|xml|js|css)$/.test(name))) {
    const details = await stat(join(distDir, relative));
    if (!details.isFile()) continue;
    const source = await readFile(join(distDir, relative), "utf8");
    if (source.includes("bear-images.sfo2.cdn.digitaloceanspaces.com")) throw new Error(`Bear CDN reference in dist/${relative}`);
  }
}

process.stdout.write(`Verified ${publishedPosts.length} published posts, ${draftPosts.length} blog drafts, ${scratchpadFiles.length} scratchpads${distExists ? ", built routes, sitemap and feeds" : ""}.\n`);
