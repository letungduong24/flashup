import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasMore: z.boolean(),
});

export type Pagination = z.infer<typeof paginationSchema>;


