import { z } from "zod";

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type Pagination = z.infer<typeof paginationSchema>;

// Paginated response schema factory
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: paginationSchema,
  });

// Filter schemas
export const flashcardFiltersSchema = z.object({
  search: z.string().optional(),
  isRemembered: z.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'review_count']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type FlashcardFilters = z.infer<typeof flashcardFiltersSchema>;
