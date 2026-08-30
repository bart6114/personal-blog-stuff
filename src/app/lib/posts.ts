import { getCollection } from "astro:content";

export function isPublishedPost(data: { draft: boolean; publishedAt?: Date }, now = new Date()) {
  return !data.draft && (!data.publishedAt || data.publishedAt.valueOf() <= now.valueOf());
}

export async function getPublishedPosts(now = new Date()) {
  const posts = await getCollection("blog", ({ data }) => isPublishedPost(data, now));
  return posts.sort((a, b) => {
    if (!a.data.publishedAt && !b.data.publishedAt) return a.data.slug.localeCompare(b.data.slug);
    if (!a.data.publishedAt) return 1;
    if (!b.data.publishedAt) return -1;
    return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
  });
}

export function formatPostDate(date: Date) {
  const day = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "UTC" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date);
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "UTC" }).format(date);
  return `${day} ${month}, ${year}`;
}
