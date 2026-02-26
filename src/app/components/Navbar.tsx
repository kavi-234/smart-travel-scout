"use client"

import { useTheme } from "../providers"

export default function Navbar() {
    const { isDark, toggleTheme } = useTheme()

    return (
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
                        <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight leading-none transition-colors duration-300">
                            Smart<span className="text-indigo-600">Travel</span>Scout
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 uppercase tracking-wide mt-0.5 transition-colors duration-300">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L13.09 8.26L19 6L15.45 11.25L22 12L15.45 12.75L19 18L13.09 15.74L12 22L10.91 15.74L5 18L8.55 12.75L2 12L8.55 11.25L5 6L10.91 8.26Z" />
                            </svg>
                            AI-Powered
                        </span>
                    </div>
                </div>

                {/* Right side: nav links + dark mode toggle */}
                <div className="flex items-center gap-3">
                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {["Explore", "Guides", "About"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-150"
                            >
                                {item}
                            </a>
                        ))}
                        <a
                            href="#search"
                            className="ml-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors duration-150 shadow-sm shadow-indigo-200"
                        >
                            Start Searching
                        </a>
                    </nav>

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                        className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 border border-slate-200 dark:border-slate-700"
                    >
                        {isDark ? (
                            /* Sun icon */
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="4" />
                                <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                            </svg>
                        ) : (
                            /* Moon icon */
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}
