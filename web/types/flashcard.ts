import { z } from "zod";

const usageSchema = z.object({
  note: z.string().optional(),
  example: z.string().optional(),
  translate: z.string().optional(),
});

export const flashcardRequestSchema = z.object({
  name: z.string().min(1, "Từ không được để trống"),
  meaning: z.string().min(1, "Nghĩa không được để trống"),
  folder_id: z.string().nullable().optional(),
  review_count: z.number().int().nonnegative().optional(),
  audio_url: z.string().nullable().optional(),
  usage: z.array(usageSchema).nullable().optional(),
  status: z.enum(["new", "review"]).optional(),
  interval: z.number().nonnegative().optional(),
  nextReview: z.coerce.date().nullable().optional(),
  easeFactor: z.number().min(1.3).optional(),
  lapseCount: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
});

export type FlashcardRequest = z.infer<typeof flashcardRequestSchema>;

export const flashcardResponseSchema = flashcardRequestSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FlashcardResponse = z.infer<typeof flashcardResponseSchema>;

export interface FlashcardFilters {
  search?: string;
  isRemembered?: boolean;
  sortBy?: "name" | "createdAt" | "review_count";
  sortOrder?: "asc" | "desc";
}


