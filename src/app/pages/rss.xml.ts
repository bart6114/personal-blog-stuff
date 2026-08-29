import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { postHtml } from "../lib/feed";
import { getPublishedPosts } from "../lib/posts";

export const GET: APIRoute = async (context) => {
  const posts = (await getPublishedPosts()).slice(0, 10);
  return rss({
    title: "barts.space",
    description: "Scribbles by Bart Smeets",
    site: context.site ?? "https://barts.space",
    items: await Promise.all(posts.map(async (post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/${post.data.slug}/`,
      content: await postHtml(post)
    }))),
    customData: "<language>en</language>"
  });
};
