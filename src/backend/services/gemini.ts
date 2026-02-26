import { inventory } from "@/backend/data/inventory"
import { GeminiResponseSchema } from "@/shared/schema"

// Use the v1 REST API directly — the npm SDK (@google/generative-ai) targets
// v1beta which is not accessible with all API key configurations.
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1/models"
const MODEL = "gemini-2.0-flash"

async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set")

    const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
        }),
    })

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
                reason: r.reason,
            }
        })
}
