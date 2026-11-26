/** Zod schemas: single source of truth for server-side input validation. */
import { z } from 'zod';
import { DOCUMENT_KINDS, VISIBILITY } from '../models/LibraryDocument.js';

const passwordRule = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a digit');

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  password: passwordRule,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const askSchema = z.object({
  question: z.string().trim().min(3).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(10)
    .optional()
    .default([]),
});

/** Query string of GET /documents. Values arrive as strings, hence coercion. */
export const documentQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  kind: z.nativeEnum(DOCUMENT_KINDS).optional(),
  year: z.coerce.number().int().optional(),
  company: z.string().trim().optional(),
  technology: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const csvToArray = (value) =>
  typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : value;

/** Metadata submitted with a PDF upload (multipart => everything is a string). */
export const documentMetadataSchema = z.object({
  kind: z.nativeEnum(DOCUMENT_KINDS).default(DOCUMENT_KINDS.REPORT),
  title: z.string().trim().min(3).max(300),
  abstract: z.string().max(5000).optional().default(''),
  language: z.string().max(5).optional().default('fr'),
  year: z.coerce.number().int().min(1990).max(2100),
  program: z.string().max(150).optional().default(''),
  authorName: z.string().max(150).optional().default(''),
  supervisorName: z.string().max(150).optional().default(''),
  companyName: z.string().max(150).optional().default(''),
  city: z.string().max(100).optional().default(''),
  keywords: z.preprocess(csvToArray, z.array(z.string()).default([])),
  technologies: z.preprocess(csvToArray, z.array(z.string()).default([])),
  visibility: z.nativeEnum(VISIBILITY).default(VISIBILITY.PUBLIC),
});

export const documentUpdateSchema = documentMetadataSchema.partial();
