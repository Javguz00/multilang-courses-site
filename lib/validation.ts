import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is too short'),
  slug: z
    .string()
    .min(2, 'Slug is too short')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
});

export const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title is too short'),
  price: z
    .string()
    .transform((v) => v.replace(/\s+/g, '').replace(',', '.'))
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), 'Price must be a number with up to 2 decimals'),
  description: z.string().optional(),
  syllabus: z.string().optional(),
  mediaUrl: z.string().url('Media URL must be a valid URL').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Category is required'),
  published: z.boolean().optional(),
  slug: z
    .string()
    .min(2, 'Slug is too short')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type CourseInput = z.infer<typeof courseSchema>;

export type FieldErrors<T> = Partial<{ [K in keyof T]: string }>;