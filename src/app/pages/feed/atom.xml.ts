import type { APIRoute } from "astro";
import { atomFeed } from "../../lib/feed";
import { getPublishedPosts } from "../../lib/posts";

export const GET: APIRoute = async () => {
  const posts = (await getPublishedPosts()).slice(0, 10);
  return new Response(await atomFeed(posts), {
    headers: { "content-type": "application/atom+xml; charset=utf-8" }
  });
};
