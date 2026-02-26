import { z } from "zod"

export const TravelResultSchema = z.object({
  id: z.number(),
  reason: z.string(),
})

export const GeminiResponseSchema = z.object({
  results: z.array(TravelResultSchema),
})
