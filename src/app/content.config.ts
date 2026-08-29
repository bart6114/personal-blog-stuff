import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: new URL("../../content/blog/", import.meta.url)
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    slug: z.string().min(1),
    draft: z.boolean(),
    tags: z.array(z.string()),
    image: z.string().optional()
  })
});

export const collections = { blog };
