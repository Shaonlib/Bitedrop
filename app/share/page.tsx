import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ShareForm } from '@/components/ShareForm'

export const metadata: Metadata = {
  title: 'Share Food',
  description: 'Post surplus food for your neighbors to claim.',
}

export default async function SharePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin?callbackUrl=/share')

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-2">New listing</p>
        <h1 className="font-serif text-4xl">Share something good</h1>
        <p className="text-brand-muted text-sm mt-2">
          Your surplus is someone else's dinner. Posts expire automatically.
        </p>
      </div>
      <ShareForm />
    </div>
  )
}
