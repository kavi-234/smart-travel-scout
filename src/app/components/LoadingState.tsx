export default function LoadingState() {
    return (
        <section className="w-full px-4 py-8 sm:py-10 flex justify-center">
            <div className="max-w-6xl w-full">
                {/* Title shimmer */}
            <div className="mb-8 flex flex-col gap-2">
                <div className="skeleton h-3 w-20 sm:w-24 rounded-full" />
                <div className="skeleton h-6 sm:h-7 w-48 sm:w-64 rounded-lg" />
            </div>

            {/* Skeleton cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700" />
                        <div className="p-5 sm:p-6 flex flex-col gap-3 sm:gap-4">
                            <div className="flex justify-between gap-2 sm:gap-3">
                                <div className="skeleton h-4 sm:h-5 flex-1 rounded-md" />
                                <div className="skeleton h-4 sm:h-5 w-10 sm:w-12 rounded-md" />
                            </div>
                            <div className="skeleton h-3 sm:h-4 w-32 sm:w-36 rounded-md" />
                            <div className="flex gap-2">
                                <div className="skeleton h-4 sm:h-5 w-14 sm:w-16 rounded-full" />
                                <div className="skeleton h-4 sm:h-5 w-16 sm:w-20 rounded-full" />
                                <div className="skeleton h-4 sm:h-5 w-12 sm:w-14 rounded-full" />
                            </div>
                            <div className="skeleton h-14 sm:h-16 w-full rounded-xl mt-2" />
                            <div className="skeleton h-8 sm:h-9 w-full rounded-xl mt-1" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Searching label */}
            <p className="text-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm mt-8 sm:mt-10 animate-pulse">
                Finding best matches for you…
            </p>
            </div>
        </section>
    )
}
