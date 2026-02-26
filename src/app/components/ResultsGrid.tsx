import ResultCard from "./ResultCard"

interface Result {
    id: number
    title: string
    location: string
    price: number
    tags: string[]
    reason: string
}

interface ResultsGridProps {
    results: Result[]
    query: string
}

export default function ResultsGrid({ results, query }: ResultsGridProps) {
    return (
        <section className="w-full px-4 py-8 sm:py-10 flex justify-center">
            <div className="max-w-6xl w-full">
                {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">
                        AI Search Results
                    </p>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {results.length} match{results.length !== 1 ? "es" : ""} for{" "}
                        <span className="text-indigo-600">&ldquo;{query}&rdquo;</span>
                    </h2>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    AI Matched
                </span>
            </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.map((result, i) => (
                        <div
                            key={result.id}
                            style={{ animationDelay: `${i * 60}ms`, opacity: 0, animation: `fadeUp 0.5s ease ${i * 60}ms forwards` }}
                        >
                            <ResultCard result={result} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
