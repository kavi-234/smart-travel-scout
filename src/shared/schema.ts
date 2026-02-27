import { z } from "zod"

/**
 * A single result entry returned by the AI.
 * Only id + reason — all other fields are hydrated from the inventory
 * to guarantee no AI-fabricated data reaches the UI.
 */
export const TravelResultSchema = z.object({
  id: z.number(),
  reason: z.string(),
})

/** Top-level AI response wrapper. */
export const AIResponseSchema = z.object({
  results: z.array(TravelResultSchema),
})
