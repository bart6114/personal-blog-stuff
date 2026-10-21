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
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    slug: z.string().min(1),
    draft: z.boolean(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    route: z.object({
      gpx: z.string().startsWith("/media/"),
      title: z.string(),
      points: z.array(z.object({
        id: z.string().regex(/^[a-z][a-z0-9-]*$/),
        title: z.string(),
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
        section: z.string().regex(/^[a-z][a-z0-9-]*$/),
        source: z.string()
      })).min(1).refine(points => new Set(points.map(point => point.id)).size === points.length, "Route point IDs must be unique")
    }).optional()
  })
});

export const collections = { blog };
