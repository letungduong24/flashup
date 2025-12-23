import { z } from "zod";
import { flashcardResponseSchema } from "./flashcard";
import { paginationSchema } from "./pagination";

export const folderRequestSchema = z.object({
  name: z.string().min(1, "Tên Flashbook không được để trống"),
  description: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  saves: z.number().int().nonnegative().optional(),
});

export type FolderRequest = z.infer<typeof folderRequestSchema>;

export const folderResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  user_id: z.string(),
  isPublic: z.boolean().optional(),
  saves: z.number().int().nonnegative().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  newCount: z.number().int().nonnegative().optional(),
  reviewCount: z.number().int().nonnegative().optional(),
});

export type FolderResponse = z.infer<typeof folderResponseSchema>;

export const folderWithFlashcardsSchema = folderResponseSchema.extend({
  flashcards: z.array(flashcardResponseSchema).optional(),
  user: z
    .object({
      id: z.string(),
      name: z.string().nullable().optional(),
      email: z.string().email(),
    })
    .optional(),
});

export type FolderWithFlashcards = z.infer<typeof folderWithFlashcardsSchema>;

export type Pagination = z.infer<typeof paginationSchema>;


