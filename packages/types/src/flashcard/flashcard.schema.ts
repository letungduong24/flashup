import { z } from "zod";
import { usageSchema } from "./usage.schema";

// Flashcard base schema
export const flashcardSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1, "Tên flashcard không được để trống"),
  meaning: z.string().min(1, "Ý nghĩa không được để trống"),
  folder_id: z.cuid().nullable().optional(),
  review_count: z.number().int().nonnegative().default(0),
  audio_url: z.string().nullable().optional(),
  usage: z.array(usageSchema).nullable().optional(),
  is_remembered: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type Flashcard = z.infer<typeof flashcardSchema>;

// Flashcard request schema (for creating/updating)
export const flashcardRequestSchema = flashcardSchema.omit({
  id: true,
  review_count: true,
}).extend({
  review_count: z.number().int().nonnegative().optional(),
  is_remembered: z.boolean().default(false).optional(),
  tags: z.array(z.string()).default([]).optional(),
});

export type FlashcardRequest = z.infer<typeof flashcardRequestSchema>;

// Flashcard response schema (same as base for now)
export const flashcardResponseSchema = flashcardSchema;

export type FlashcardResponse = z.infer<typeof flashcardResponseSchema>;

