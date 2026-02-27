"use client"

interface SearchBoxProps {
    query: string
    onQueryChange: (v: string) => void
    onSearch: () => void
    onClear: () => void
    loading: boolean
}

const suggestions = [
    "🏄 Beach surfing under $100",
    "🏔️ Mountain hiking with views",
    "🌴 Tropical island getaway",
    "🏙️ City culture & food",
    "🧘 Wellness & spa retreat",
]

export default function SearchBox({ query, onQueryChange, onSearch, onClear, loading }: SearchBoxProps) {
    function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !loading) onSearch()
    }

    return (
        <div id="search" className="w-full">

            {/* Search input row */}
            <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/40 border border-slate-200 dark:border-slate-700 group transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/50 focus-within:border-indigo-300 dark:focus-within:border-indigo-700">
                {/* Icon */}
                <div className="flex items-center pl-4 pr-2 text-slate-400 dark:text-slate-500">
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Describe your perfect travel experience..."
                    disabled={loading}
                    className="flex-1 py-4 px-3 text-slate-800 dark:text-slate-100 text-base sm:text-lg placeholder-slate-400 dark:placeholder-slate-500 bg-transparent outline-none disabled:opacity-60 font-medium"
                />

                {/* Clear button */}
                {query && !loading && (
                    <button
                        onClick={onClear}
                        className="flex items-center px-2 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                        aria-label="Clear"
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Search button */}
                <div className="pr-2 py-1.5">
                    <button
                        onClick={onSearch}
                        disabled={loading || !query.trim()}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-lg active:scale-95 min-w-[100px] sm:min-w-[120px] justify-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Searching</span>
                            </>
                        ) : (
                            <>
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span>Search</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Suggestion chips */}
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                    <button
                        key={s}
                        onClick={() => onQueryChange(s.replace(/^[\p{Emoji}\s]+/u, "").trim())}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-150 shadow-sm"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    )
}
