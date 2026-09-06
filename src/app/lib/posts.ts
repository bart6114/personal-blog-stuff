import { getCollection } from "astro:content";

export function isPublishedPost(data: { draft: boolean; publishedAt?: Date }, now = new Date()) {
  return !data.draft && (!data.publishedAt || data.publishedAt.valueOf() <= now.valueOf());
}

async function getPosts(now: Date, includeDrafts = false) {
  const posts = await getCollection("blog", ({ data }) =>
    isPublishedPost(data, now) || (includeDrafts && data.draft)
  );
  return posts.sort((a, b) => {
    if (a.data.draft !== b.data.draft) return a.data.draft ? -1 : 1;
    if (!a.data.publishedAt && !b.data.publishedAt) return a.data.slug.localeCompare(b.data.slug);
    if (!a.data.publishedAt) return 1;
    if (!b.data.publishedAt) return -1;
    return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
  });
}

export function getPublishedPosts(now = new Date()) {
  return getPosts(now);
}

export function getVisiblePosts(now = new Date()) {
  return getPosts(now, import.meta.env.DEV && import.meta.env.SHOW_DRAFTS === "true");
}

export function formatPostDate(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "UTC" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date);
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "UTC" }).format(date);
  return `${day} ${month}, ${year}`;
}
