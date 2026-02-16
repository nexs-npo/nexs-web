import { defineCollection, z } from 'astro:content';

const knowledgeCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    category: z.enum([
      'foundation',
      'thesis',
      'protocol',
      'evidence',
      'update',
    ]),
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
    proposedAt: z.coerce.string(),
    attachments: z
      .array(
        z.object({
          label: z.string(),
          file: z.string().nullable(),
        }),
      )
      .optional(),
    discussionLogs: z
      .array(
        z.object({
          date: z.coerce.string().nullable(),
          type: z.enum(['slack', 'github', 'meeting']),
          summary: z.string(),
          detail: z.string(),
        }),
      )
      .optional(),
    resolutionText: z.string().optional(),
  }),
});

const journalCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    author: z.string(),
    summary: z.string(),
  }),
});

const announcementsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    type: z.enum(['news', 'event', 'update', 'important']),
    summary: z.string(),
  }),
});

const documentsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    docType: z.enum(['CONST', 'PHIL', 'REGS', 'RPT']),
    domain: z.string(),
    topic: z.string(),
    version: z.string(),
    effectiveDate: z.string(),
    summary: z.string(),
  }),
});

const resolutionMaterialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    resolutionId: z.string(),
    date: z.string(),
    type: z.enum(['background', 'data', 'proposal', 'reference']),
    summary: z.string(),
  }),
});

export const collections = {
  knowledge: knowledgeCollection,
  resolutions: resolutionsCollection,
  journal: journalCollection,
  announcements: announcementsCollection,
  documents: documentsCollection,
  'resolution-materials': resolutionMaterialsCollection,
};
