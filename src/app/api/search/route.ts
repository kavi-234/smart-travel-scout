import { NextRequest, NextResponse } from "next/server"
import { searchTravel } from "@/backend/services/gemini"

export async function POST(request: NextRequest) {

  try {

    const body = await request.json()
    const query = body.query

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const results = await searchTravel(query)

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
