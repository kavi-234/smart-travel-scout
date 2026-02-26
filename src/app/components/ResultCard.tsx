interface ResultCardProps {
    result: {
        id: number
        title: string
        location: string
        price: number
        tags: string[]
        reason: string
    }
}

const TAG_COLORS: Record<string, string> = {
    beach: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900",
    surf: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-900",
    mountain: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900",
    hiking: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-900",
    tropical: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900",
    island: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-900",
    city: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-900",
    culture: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900",
    wellness: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900",
    spa: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-900",
    default: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-400 dark:border-slate-600",
}

function getTagColor(tag: string): string {
    const lower = tag.toLowerCase()
    for (const key of Object.keys(TAG_COLORS)) {
        if (lower.includes(key)) return TAG_COLORS[key]
    }
    return TAG_COLORS.default
}

export default function ResultCard({ result }: ResultCardProps) {
    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md shadow-slate-100/80 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-900/70 hover:-translate-y-1 transition-all duration-250 overflow-hidden flex flex-col animate-fade-in">

            {/* Card header band */}
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />

            <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">

                {/* Title + price row */}
                <div className="flex items-start justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-150 line-clamp-2">
                        {result.title}
                    </h2>
                    <span className="shrink-0 text-base sm:text-lg font-extrabold text-indigo-600">
                        ${result.price}
                    </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">{result.location}</span>
                </div>

                {/* Tags */}
                {result.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {result.tags.map((tag) => (
                            <span
                                key={tag}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTagColor(tag)}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* AI match reason */}
                <div className="mt-auto pt-2">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                        <div className="shrink-0 mt-0.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                            {result.reason}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="px-5 sm:px-6 pb-4 sm:pb-5">
                <button className="w-full py-2 sm:py-2.5 rounded-xl border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:border-indigo-600 transition-all duration-200">
                    View Details
                </button>
            </div>
        </div>
    )
}
