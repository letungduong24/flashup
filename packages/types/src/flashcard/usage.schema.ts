import { z } from "zod";

// Usage schema for nested JSON in Flashcard
export const usageSchema = z.object({
  note: z.string().optional(),
  example: z.string().optional(),
  translate: z.string().optional(),
});

export type Usage = z.infer<typeof usageSchema>;

