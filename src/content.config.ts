import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Use the new v5/v6 glob loader to load md/mdx files in src/content/blog/
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    readTime: z.string(),
    tags: z.array(z.string()),
    summary: z.string(),
    coverImage: z.string().optional(),
    author: z.string().default('Bhagaban Ghadai'),
  }),
});

export const collections = { blog };
