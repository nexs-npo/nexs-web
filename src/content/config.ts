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

const resolutionsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    id: z.string(),
    status: z.enum(['review', 'approved', 'rejected']),
    proposer: z.string(),
    proposedAt: z.string(),
    attachments: z.array(
      z.object({
        label: z.string(),
        file: z.string().nullable(),
      })
    ).optional(),
    discussionLogs: z.array(
      z.object({
        date: z.string().nullable(),
        type: z.enum(['slack', 'github', 'meeting']),
        summary: z.string(),
        detail: z.string(),
      })
    ).optional(),
    resolutionText: z.string().optional(),
    approvals: z.array(
      z.object({
        name: z.string(),
        date: z.string().nullable(),
      })
    ).optional(),
  }),
});

export const collections = {
  knowledge: knowledgeCollection,
  resolutions: resolutionsCollection,
};
