import { marked } from "marked";
import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

const xmlEscape = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export async function postHtml(post: BlogPost) {
  const html = await marked.parse(post.body ?? "", { async: true, gfm: false });
  return html.replaceAll('src="/', 'src="https://barts.space/').replaceAll("src='/", "src='https://barts.space/");
}

export async function atomFeed(posts: BlogPost[]) {
  const updated = posts[0]?.data.updatedAt ?? posts[0]?.data.publishedAt ?? new Date(0);
  const entries = await Promise.all(posts.map(async (post) => {
    const url = `https://barts.space/${post.data.slug}/`;
    const content = await postHtml(post);
    const updatedAt = post.data.updatedAt ?? post.data.publishedAt ?? new Date(0);
    const published = post.data.publishedAt
      ? `\n    <published>${post.data.publishedAt.toISOString()}</published>`
      : "";
    return `  <entry>
    <id>${xmlEscape(url)}</id>
    <title>${xmlEscape(post.data.title)}</title>
    <link href="${xmlEscape(url)}" rel="alternate" />${published}
    <updated>${updatedAt.toISOString()}</updated>
    <author><name>Bart Smeets</name></author>
    <summary>${xmlEscape(post.data.description)}</summary>
    <content type="html"><![CDATA[${content.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content>
  </entry>`;
  }));

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>https://barts.space/</id>
  <title>barts.space</title>
  <subtitle>Scribbles by Bart Smeets</subtitle>
  <link href="https://barts.space/" rel="alternate" />
  <link href="https://barts.space/feed/" rel="self" type="application/atom+xml" />
  <updated>${updated.toISOString()}</updated>
${entries.join("\n")}
</feed>
`;
}
