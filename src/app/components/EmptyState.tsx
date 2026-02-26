export default function EmptyState() {
    return (
        <div className="text-center py-16 sm:py-20 px-4 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-4 sm:mb-6">
                <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No experiences found</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                We couldn&apos;t find any travel experiences matching your query.
                Try different keywords like <em>&ldquo;beach&rdquo;</em>, <em>&ldquo;mountain&rdquo;</em>, or <em>&ldquo;city culture&rdquo;</em>.
            </p>
        </div>
    )
}
