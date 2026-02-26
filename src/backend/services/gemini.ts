import { inventory } from "@/backend/data/inventory"
import { GeminiResponseSchema } from "@/shared/schema"

// Use the v1 REST API directly — the npm SDK (@google/generative-ai) targets
// v1beta which is not accessible with all API key configurations.
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1/models"
const MODEL = "gemini-2.0-flash"

/** Hard cap on Gemini output tokens — prevents runaway responses and reduces latency. */
const MAX_OUTPUT_TOKENS = 512

/** Abort the Gemini request if it hasn't responded within this many milliseconds. */
const FETCH_TIMEOUT_MS = 10_000

/**
 * Low-level wrapper: sends a prompt to Gemini and returns the raw text response.
 * Throws on non-2xx HTTP status, rate limiting, or timeout.
 */
async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set")

    const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let res: Response
    try {
        res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
            }),
        })
    } catch (err: any) {
        if (err?.name === "AbortError") throw new Error("Gemini request timed out")
        throw err
    } finally {
        clearTimeout(timer)
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = (err as any)?.error?.message ?? res.statusText
        if (res.status === 429) {
            throw Object.assign(new Error("RATE_LIMITED"), { statusCode: 429 })
        }
        throw new Error(`Gemini API error ${res.status}: ${msg}`)
    }

    const data = await res.json()
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    if (!text) throw new Error("Empty response from Gemini")
    return text
}

/**
 * Matches a free-text user query against the travel inventory using Gemini AI.
 *
 * Strategy:
 *  1. Send only slim inventory fields (id, title, location, tags) to minimise token use.
 *  2. Instruct Gemini to return a strict JSON schema — no prose, no markdown.
 *  3. Validate the response with Zod; reject anything that doesn't conform.
 *  4. Filter IDs against the real inventory so Gemini cannot invent destinations.
 *  5. Clamp reason strings to 200 chars so card layout is never broken.
 *
 * @param query - Sanitised, length-checked user search string.
 * @returns Array of matched inventory items enriched with an AI-generated reason.
 */
export async function searchTravel(query: string) {

    // Only send fields relevant to matching — reduces token usage significantly
    const slim = inventory.map(({ id, title, location, tags }) => ({ id, title, location, tags }))

    const prompt = `You are a travel recommendation assistant.
Return ONLY a raw JSON object — no markdown, no explanation.

Inventory: ${JSON.stringify(slim)}

User query: "${query}"

JSON format: {"results":[{"id":<number>,"reason":"<why it matches>"}]}`

    let rawText: string
    try {
        rawText = await callGemini(prompt)
    } catch (err: any) {
        console.error("Gemini call failed:", err.message)
        throw err
    }

    // Strip markdown code fences if present (belt-and-suspenders)
    const text = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()

    let parsed: unknown
    try {
        parsed = JSON.parse(text)
    } catch {
        console.error("Non-JSON response from Gemini:", rawText)
        throw new Error(`Gemini returned non-JSON: ${rawText.slice(0, 300)}`)
    }

    let validated: { results: { id: number; reason: string }[] }
    try {
        validated = GeminiResponseSchema.parse(parsed) as typeof validated
    } catch (err: any) {
        console.error("Schema validation failed:", err.message, "| Parsed:", parsed)
        throw new Error(`Schema validation failed: ${err.message}`)
    }

    // Guardrail: only return IDs that actually exist in inventory — Gemini cannot invent destinations.
    return validated.results
        .filter((r) => inventory.some((inv) => inv.id === r.id))
        .map((r) => {
            const item = inventory.find((inv) => inv.id === r.id)!
            return {
                id: item.id,
                title: item.title,
                location: item.location,
                price: item.price,
                tags: item.tags,
                // Clamp reason to 200 chars so card layout is never broken by runaway text
                reason: r.reason.slice(0, 200),
            }
        })
}
