import { z } from "zod";
import { flashcardResponseSchema } from "../flashcard/flashcard.schema";

// Folder base schema
export const folderSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1, "Tên folder không được để trống"),
  description: z.string().nullable().optional(),
  user_id: z.cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Folder = z.infer<typeof folderSchema>;

// Folder request schema (for creating/updating)
export const folderRequestSchema = folderSchema.omit({
  id: true,
  user_id: true,
  createdAt: true,
  updatedAt: true,
});

export type FolderRequest = z.infer<typeof folderRequestSchema>;

// Folder response schema (same as base for now)
export const folderResponseSchema = folderSchema;

export type FolderResponse = z.infer<typeof folderResponseSchema>;

// Folder with flashcards schema (for detailed view)
export const folderWithFlashcardsSchema = folderSchema.extend({
  flashcards: z.array(flashcardResponseSchema).optional(),
});

export type FolderWithFlashcards = z.infer<typeof folderWithFlashcardsSchema>;

