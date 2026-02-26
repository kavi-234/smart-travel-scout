interface ErrorMessageProps {
    message: string
    onDismiss: () => void
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                <div className="shrink-0 mt-0.5">
                    <svg width="18" height="18" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Something went wrong</p>
                    <p className="text-sm text-red-500 dark:text-red-500 mt-0.5">{message}</p>
                </div>
                <button
                    onClick={onDismiss}
                    className="shrink-0 text-red-300 dark:text-red-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
