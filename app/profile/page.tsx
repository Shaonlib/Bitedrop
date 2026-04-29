import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ListingCard } from '@/components/ListingCard'
import Image from 'next/image'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin?callbackUrl=/profile')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      listings: {
        where: { status: { not: 'DELETED' } },
        include: { user: { select: { id: true, name: true, image: true, karmaScore: true, neighborhood: true } }, _count: { select: { claims: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      claims: {
        include: {
          listing: {
            include: { user: { select: { id: true, name: true, image: true, karmaScore: true, neighborhood: true } }, _count: { select: { claims: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      reviewsReceived: {
        include: { author: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!user) redirect('/')

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10 pb-8 border-b border-brand-border">
        {user.image ? (
          <Image src={user.image} alt={user.name ?? ''} width={72} height={72} className="rounded-full flex-shrink-0" />
        ) : (
          <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-brand-warm flex items-center justify-center text-2xl font-serif flex-shrink-0">
            {user.name?.[0] ?? '?'}
          </div>
        )}
        <div className="flex-1">
          <h1 className="font-serif text-3xl mb-1">{user.name}</h1>
          <p className="text-brand-muted text-sm mb-3">{user.email}</p>
          {user.bio && <p className="text-sm leading-relaxed max-w-lg">{user.bio}</p>}
          <div className="flex gap-6 mt-3 text-sm">
            <div>
              <span className="font-medium text-brand-orange">{user.totalShares}</span>
              <span className="text-brand-muted ml-1">shares</span>
            </div>
            <div>
              <span className="font-medium text-brand-orange">★ {user.karmaScore.toFixed(1)}</span>
              <span className="text-brand-muted ml-1">karma</span>
            </div>
            {user.neighborhood && (
              <div>
                <span className="text-brand-muted">📍 {user.neighborhood}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My listings */}
      <section className="mb-10">
        <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">
          My listings ({user.listings.length})
        </h2>
        {user.listings.length === 0 ? (
          <p className="text-brand-muted text-sm">You haven't shared anything yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} showStatus />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      {user.reviewsReceived.length > 0 && (
        <section>
          <h2 className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">
            Reviews
          </h2>
          <div className="space-y-3">
            {user.reviewsReceived.map((review) => (
              <div key={review.id} className="border border-brand-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-brand-amber">{'★'.repeat(review.rating)}</span>
                  <span className="text-xs text-brand-muted">{review.author.name}</span>
                </div>
                {review.comment && <p className="text-sm text-brand-muted">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
