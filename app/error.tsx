'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="font-serif text-2xl mb-2">Something went wrong</h2>
      <p className="text-brand-muted text-sm mb-6 max-w-sm">{error.message}</p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-brand-dark text-brand-cream text-sm rounded-lg hover:opacity-80 transition-opacity"
      >
        Try again
      </button>
    </div>
  )
}
