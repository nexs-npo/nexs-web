import { defineCollection, z } from 'astro:content';

const knowledgeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    category: z.enum(['foundation', 'thesis', 'protocol', 'evidence', 'update']),
    author: z.string(),
    date: z.string(),
    relatedIds: z.array(z.string()).optional(),
  }),
});

export const collections = {
  knowledge: knowledgeCollection,
};
