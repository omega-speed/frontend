import { z } from "zod";

export const metaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  total_pages: z.number(),
  has_next_page: z.boolean(),
  has_prev_page: z.boolean(),
});

export const apiResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    status_code: z.number(),
    message: z.string(),
    data: dataSchema,
  });

export const paginatedApiResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    status_code: z.number(),
    message: z.string(),
    data: z.array(itemSchema),
    meta: metaSchema,
  });

export type Meta = z.infer<typeof metaSchema>;
