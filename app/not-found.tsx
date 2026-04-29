import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">404</p>
      <h1 className="font-serif text-4xl mb-3">Page not found</h1>
      <p className="text-brand-muted text-sm mb-8 max-w-xs">
        This listing may have expired or been removed.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-brand-dark text-brand-cream text-sm rounded-xl hover:opacity-80 transition-opacity"
      >
        Back to feed
      </Link>
    </div>
  )
}
