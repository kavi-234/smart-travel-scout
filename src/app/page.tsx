"use client"

import { useState } from "react"
import {
  Navbar,
  SearchBox,
  ResultsGrid,
  LoadingState,
  EmptyState,
  ErrorMessage,
} from "./components"

interface SearchResult {
  id: number
  title: string
  location: string
  price: number
  tags: string[]
  reason: string
}

export default function Home() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch() {
    const q = query.trim()
    if (!q || loading) return

    setLoading(true)
    setError(null)
    setHasSearched(true)
    setResults([])

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
      } else {
        setResults(data.results || [])
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const showResults = hasSearched && !loading && !error && results.length > 0
  const showEmpty = hasSearched && !loading && !error && results.length === 0

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Page body grows to fill space, pushing footer down ── */}
      <main className="flex-1 flex flex-col">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-12 sm:py-16 flex flex-col items-center">
          {/* Background tint */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 inset-x-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)" }}
          />

          {/* Centered content column */}
          <div className="relative w-full max-w-3xl mx-auto px-6 text-center">

            {/* Eyebrow badge */}
            <div className="animate-fade-up inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-indigo-50/60 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L19 6L15.45 11.25L22 12L15.45 12.75L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.75L2 12L8.55 11.25L5 6L10.91 8.26Z" />
              </svg>
              Powered by Gemini AI
            </div>

            {/* Heading */}
            <h1
              className="animate-fade-up font-black tracking-tight text-slate-900 dark:text-slate-50 mb-4"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.15 }}
            >
              Discover Your Perfect{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                Travel Experience
              </span>
            </h1>

            {/* Subheading */}
            <p className="animate-fade-up-delay text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed mb-8 mx-auto">
              Tell us what kind of adventure you’re dreaming of, and our AI will craft the perfect travel match for you.
            </p>

            {/* Search box — owns its own width */}
            <div className="animate-fade-up-delay2 w-full">
              <SearchBox
                query={query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                loading={loading}
              />
            </div>

            {/* Stats strip */}
            {!hasSearched && (
              <div className="animate-fade-up-delay2 mt-10 flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
                {[
                  { value: "500+", label: "Destinations" },
                  { value: "AI", label: "Smart Matching" },
                  { value: "Instant", label: "Results" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{value}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Error ── */}
        {error && (
          <div className="max-w-3xl mx-auto w-full px-4 pb-4">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* ── Loading ── */}
        {loading && <LoadingState />}

        {/* ── Results ── */}
        {showResults && <ResultsGrid results={results} query={query} />}

        {/* ── Empty state ── */}
        {showEmpty && (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState />
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-slate-400 dark:text-slate-500">
            ✈️ Smart Travel Scout — AI-powered travel discovery
          </span>
          <span className="text-xs text-slate-300 dark:text-slate-600">
            © {new Date().getFullYear()} SmartTravelScout
          </span>
        </div>
      </footer>

    </div>
  )
}