import { NextRequest, NextResponse } from "next/server"
import { searchTravel } from "@/backend/services/gemini"

/** Maximum characters we forward to the AI — guards against prompt injection and runaway tokens. */
const MAX_QUERY_LENGTH = 300

export async function POST(request: NextRequest) {

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
        { error: "API quota exceeded. Please wait a minute and try again, or generate a new API key at https://aistudio.google.com/app/apikey" },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: "Something went wrong. Check the server logs for details." },
      { status: 500 }
    )

  }

}
