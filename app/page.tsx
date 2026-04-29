import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ListingCard } from '@/components/ListingCard'
import { FeedFilters } from '@/components/FeedFilters'
import { ListingCardSkeleton } from '@/components/ListingCardSkeleton'
import { HeroStats } from '@/components/HeroStats'

interface PageProps {
  searchParams: {
    q?: string
    category?: string
    vegan?: string
    glutenFree?: string
  }
}

async function ListingsFeed({ searchParams }: PageProps) {
  const listings = await prisma.listing.findMany({
    where: {
      status: 'AVAILABLE',
      expiresAt: { gt: new Date() },
      ...(searchParams.q && {
        OR: [
          { title: { contains: searchParams.q, mode: 'insensitive' } },
          { description: { contains: searchParams.q, mode: 'insensitive' } },
        ],
      }),
      ...(searchParams.category && { category: searchParams.category as any }),
      ...(searchParams.vegan === 'true' && { isVegan: true }),
      ...(searchParams.glutenFree === 'true' && { isGlutenFree: true }),
    },
    include: {
      user: { select: { id: true, name: true, image: true, karmaScore: true, neighborhood: true } },
      _count: { select: { claims: true } },
    },
    orderBy: { expiresAt: 'asc' },
    take: 50,
  })

  if (listings.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🍽</div>
        <h3 className="font-serif text-2xl text-brand-dark mb-2">Nothing here yet</h3>
        <p className="text-brand-muted text-sm">
          {searchParams.q ? `No listings match "${searchParams.q}"` : 'Be the first to share food in your area'}
        </p>
      </div>
    )
  }

  return (
    <>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </>
  )
}

export default function HomePage({ searchParams }: PageProps) {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-widest uppercase text-brand-muted mb-4">
              Reykjavík Food Network
            </p>
            <h1 className="font-serif text-5xl md:text-6xl leading-none tracking-tight mb-4">
              Good food,<br />
              <em className="italic text-brand-orange">shared freely.</em>
            </h1>
            <p className="text-brand-muted text-base leading-relaxed max-w-md">
              BiteDrop connects neighbors with surplus food to those who want it.
              Post what you have, claim what you need — zero waste, real community.
            </p>
          </div>
          <Suspense fallback={<div className="mt-8 h-20" />}>
            <HeroStats />
          </Suspense>
        </div>
      </section>

      {/* Feed */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <FeedFilters searchParams={searchParams} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Suspense
            fallback={Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          >
            <ListingsFeed searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
