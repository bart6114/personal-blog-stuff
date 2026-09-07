import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { load } from "cheerio";

// Import the files as image metadata so Astro can optimize existing /media/ URLs.
// The public originals remain available to old feeds, links, and social previews.
const images = import.meta.glob<{ default: ImageMetadata }>(
  "../../public/media/**/*.{jpg,jpeg,png,webp,avif}"
);

export async function optimizeArticleImages(html: string, feed = false) {
  const $ = load(html, {}, false);
  await Promise.all($("img").toArray().map(async (element) => {
    const img = $(element);
    const source = img.attr("src") ?? "";
    const importImage = images[`../../public${source}`];
    if (!importImage) return;

    const { default: image } = await importImage();
    const width = Math.min(image.width, 720);
    const optimized = await getImage({
      src: image,
      width,
      format: "webp",
      quality: 80,
      layout: feed ? "none" : "constrained",
      // Match --reading-width and the two --page-gutter values in global.css.
      ...(!feed && { sizes: `min(${width}px, calc(100vw - clamp(32px, 5vw, 88px)))` })
    });
    for (const [key, value] of Object.entries(optimized.attributes)) {
      if (value != null) img.attr(key, String(value));
    }
    img.attr("src", optimized.src);
    img.attr("data-original-src", source);
    if (!feed) img.attr("srcset", optimized.srcSet.attribute);
  }));

  if (feed) {
    $("img").each((_, element) => {
      const img = $(element);
      const source = img.attr("src");
      if (source?.startsWith("/")) img.attr("src", new URL(source, "https://barts.space").href);
      img.removeAttr("data-original-src");
      img.removeAttr("loading");
    });
  }
  return $.html();
}

export async function socialImage(source: string) {
  const importImage = images[`../../public${source}`];
  if (!importImage) return source;
  const { default: image } = await importImage();
  const optimized = await getImage({
    src: image,
    width: Math.min(image.width, 1200),
    format: image.format === "png" ? "png" : "jpeg",
    quality: 80,
    layout: "none"
  });
  return optimized.src;
}
