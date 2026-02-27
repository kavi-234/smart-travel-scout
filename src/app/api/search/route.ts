import { NextRequest, NextResponse } from "next/server"
import { searchTravel } from "@/backend/services/openai"

/** Maximum characters we forward to the AI — guards against prompt injection and runaway tokens. */
const MAX_QUERY_LENGTH = 300

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter — max 5 requests per IP per 60 seconds.
// This prevents a rapid-click loop from burning through OpenAI quota before
// the retry backoff in openai.ts even has a chance to kick in.
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) return true
  entry.count++
  return false
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before searching again." },
      { status: 429 }
    )
  }

  try {

    const body = await request.json()
    const query = typeof body.query === "string" ? body.query.trim() : ""

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query is too long. Please keep it under ${MAX_QUERY_LENGTH} characters.` },
        { status: 400 }
      )
    }

    // Strip any embedded instruction-injection attempts (angle-bracket tags, prompt keywords)
    const sanitizedQuery = query.replace(/<[^>]*>/g, "").replace(/\bignore\s+(?:above|previous|all)\b/gi, "")

    const results = await searchTravel(sanitizedQuery)

    return NextResponse.json({ results })

  } catch (error: any) {

    console.error("Search error:", error)

    if (error?.message === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "API quota exceeded. Please wait a minute and try again, or check your OpenAI usage at https://platform.openai.com/usage" },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Something went wrong. Check the server logs for details." },
      { status: 500 }
    )

  }

}
