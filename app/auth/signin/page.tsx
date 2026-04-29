import type { Metadata } from 'next'
import { SignInButtons } from '@/components/SignInButtons'

export const metadata: Metadata = { title: 'Sign in' }

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl mb-2">
            Welcome to Bite<span className="text-brand-orange">Drop</span>
          </h1>
          <p className="text-brand-muted text-sm">
            Sign in to share food or claim listings from your neighbors.
          </p>
        </div>

        {searchParams.error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            {searchParams.error === 'OAuthAccountNotLinked'
              ? 'This email is already linked to another provider.'
              : 'Sign-in failed. Please try again.'}
          </div>
        )}

        <SignInButtons callbackUrl={searchParams.callbackUrl ?? '/'} />

        <p className="text-center text-xs text-brand-muted mt-6">
          By signing in you agree to share food kindly.
        </p>
      </div>
    </div>
  )
}
