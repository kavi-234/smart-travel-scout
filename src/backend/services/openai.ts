import OpenAI from "openai"
import { inventory } from "@/backend/data/inventory"
import { AIResponseSchema } from "@/shared/schema"

const MODEL = "gpt-4o-mini"

/** Hard cap on OpenAI output tokens — prevents runaway responses and reduces latency. */
const MAX_OUTPUT_TOKENS = 512

/** Abort the OpenAI request if it hasn't responded within this many milliseconds. */
const FETCH_TIMEOUT_MS = 15_000

/** How many times to retry on a 429 before giving up. */
const MAX_RETRIES = 3

/** Base delay (ms) for exponential backoff — doubles each attempt. */
const RETRY_BASE_DELAY_MS = 2_000

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/**
 * Low-level wrapper: sends a prompt to OpenAI and returns the raw text response.
 * Automatically retries up to MAX_RETRIES times on 429 with exponential backoff.
 */
async function callOpenAI(prompt: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set")

    const client = new OpenAI({ apiKey, timeout: FETCH_TIMEOUT_MS })

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: MODEL,
                max_tokens: MAX_OUTPUT_TOKENS,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "You are a travel recommendation assistant. Always respond with raw JSON only — no markdown, no explanation." },
                    { role: "user", content: prompt },
                ],
            })

            const text = completion.choices[0]?.message?.content ?? ""
            if (!text) throw new Error("Empty response from OpenAI")
            return text

        } catch (err: any) {
            const status = err?.status ?? err?.response?.status
            if (status === 429) {
                if (attempt < MAX_RETRIES) {
                    const delay = RETRY_BASE_DELAY_MS * 2 ** attempt
                    console.warn(`OpenAI 429 — retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`)
                    await sleep(delay)
                    continue
                }
                throw Object.assign(new Error("RATE_LIMITED"), { statusCode: 429 })
            }
            throw err
        }
    }

    throw Object.assign(new Error("RATE_LIMITED"), { statusCode: 429 })
}

// ---------------------------------------------------------------------------
// Local keyword fallback — used when OpenAI is unavailable / rate-limited.
// ---------------------------------------------------------------------------
function localFallback(query: string) {
    const tokens = query
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 2)

    const scored = inventory
        .map((item) => {
            const haystack = [
                item.title.toLowerCase(),
                item.location.toLowerCase(),
                ...item.tags.map((t) => t.toLowerCase()),
            ].join(" ")

            const matches = tokens.filter((t) => haystack.includes(t))
            return { item, score: matches.length, matches }
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)

    const pool = scored.length > 0 ? scored : inventory.map((item) => ({ item, score: 0, matches: [] }))

    return pool.map(({ item, matches }) => ({
        id: item.id,
        title: item.title,
        location: item.location,
        price: item.price,
        tags: item.tags,
        reason: matches.length > 0
            ? `Matched your search for "${matches.join(", ")}" (offline mode — AI quota exceeded).`
            : "Showing all destinations — AI quota exceeded, try again later.",
    }))
}

/**
 * Matches a free-text user query against the travel inventory using OpenAI.
 * Falls back to local keyword matching if OpenAI is rate-limited.
 */
export async function searchTravel(query: string) {
    const slim = inventory.map(({ id, title, location, tags }) => ({ id, title, location, tags }))

    const prompt = `Inventory: ${JSON.stringify(slim)}

User query: "${query}"

Return a JSON object in this exact format: {"results":[{"id":<number>,"reason":"<why it matches>"}]}
Only include items that genuinely match the query.`

    let rawText: string
    try {
        rawText = await callOpenAI(prompt)
    } catch (err: any) {
        console.error("OpenAI call failed:", err.message)
        if (err?.message === "RATE_LIMITED") {
            console.warn("OpenAI rate-limited — using local keyword fallback")
            return localFallback(query)
        }
        throw err
    }

    let parsed: unknown
    try {
        parsed = JSON.parse(rawText)
    } catch {
        console.error("Non-JSON response from OpenAI:", rawText)
        throw new Error(`OpenAI returned non-JSON: ${rawText.slice(0, 300)}`)
    }

    let validated: { results: { id: number; reason: string }[] }
    try {
        validated = AIResponseSchema.parse(parsed) as typeof validated
    } catch (err: any) {
        console.error("Schema validation failed:", err.message, "| Parsed:", parsed)
        throw new Error(`Schema validation failed: ${err.message}`)
    }

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
                reason: r.reason.slice(0, 200),
            }
        })
}
