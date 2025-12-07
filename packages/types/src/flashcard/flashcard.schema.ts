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
  status: z.enum(["new", "review"]).default("new"),
  interval: z.number().nonnegative().default(0), // số ngày chờ đến lần review tiếp theo
  nextReview: z.coerce.date().nullable().optional(), // thời điểm review tiếp theo
  easeFactor: z.number().min(1.3).default(2.5), // độ dễ của thẻ, min 1.3
  lapseCount: z.number().int().nonnegative().default(0), // tổng số lần quên
  tags: z.array(z.string()).default([]),
});

export type Flashcard = z.infer<typeof flashcardSchema>;

// Flashcard request schema (for creating/updating)
export const flashcardRequestSchema = flashcardSchema.omit({
  id: true,
  review_count: true,
}).extend({
  review_count: z.number().int().nonnegative().optional(),
  status: z.enum(["new", "review"]).optional(),
  interval: z.number().nonnegative().optional(),
  nextReview: z.coerce.date().nullable().optional(),
  easeFactor: z.number().min(1.3).optional(),
  lapseCount: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).default([]).optional(),
});

export type FlashcardRequest = z.infer<typeof flashcardRequestSchema>;

// Flashcard response schema (same as base for now)
export const flashcardResponseSchema = flashcardSchema;

export type FlashcardResponse = z.infer<typeof flashcardResponseSchema>;

