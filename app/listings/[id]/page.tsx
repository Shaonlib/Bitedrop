import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ClaimButton } from '@/components/ClaimButton'
import { CountdownTimer } from '@/components/CountdownTimer'
import { categoryEmoji } from '@/lib/utils'
import { MapPin, Users, Leaf, ShieldCheck, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, imageUrl: true },
  })
  if (!listing) return { title: 'Not found' }
  return {
    title: listing.title,
    description: listing.description ?? `Pick up ${listing.title} from a neighbor on BiteDrop.`,
    openGraph: {
      title: listing.title,
      images: listing.imageUrl ? [listing.imageUrl] : [],
    },
  }
}

export default async function ListingPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, image: true, karmaScore: true, neighborhood: true, totalShares: true } },
      claims: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { claims: true } },
    },
  })

  if (!listing) notFound()

  const isOwner = session?.user?.id === listing.userId
  const userClaim = session
    ? listing.claims.find((c) => c.userId === session.user.id)
    : null
  const isExpired = listing.expiresAt < new Date()
  const isUnavailable = listing.status !== 'AVAILABLE' || isExpired

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to feed
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-brand-warm rounded-xl overflow-hidden">
          {listing.imageUrl ? (
            <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-7xl">
              {categoryEmoji(listing.category)}
            </div>
          )}
          {isUnavailable && (
            <div className="absolute inset-0 bg-brand-dark/60 flex items-center justify-center">
              <span className="font-mono text-sm tracking-widest uppercase text-white bg-brand-dark/80 px-4 py-2 rounded">
                {listing.status === 'CLAIMED' ? 'Claimed' : 'Expired'}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start gap-2 mb-1">
            <span className="font-mono text-xs tracking-wider uppercase text-brand-muted bg-brand-warm px-2 py-1 rounded">
              {listing.category.replace('_', ' ')}
            </span>
            {listing.isVegan && (
              <span className="font-mono text-xs tracking-wider uppercase text-brand-sage bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                <Leaf size={10} /> Vegan
              </span>
            )}
            {listing.isGlutenFree && (
              <span className="font-mono text-xs tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                <ShieldCheck size={10} /> GF
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-3">{listing.title}</h1>

          {listing.description && (
            <p className="text-brand-muted text-sm leading-relaxed mb-4">{listing.description}</p>
          )}

          <div className="flex flex-col gap-2 mb-6 text-sm text-brand-muted">
            <div className="flex items-center gap-2">
              <Users size={14} />
              <span>{listing.servings} serving{listing.servings !== 1 ? 's' : ''}</span>
            </div>
            {listing.address && (
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{listing.address}</span>
              </div>
            )}
          </div>

          {/* Countdown */}
          {!isUnavailable && (
            <div className="mb-6">
              <CountdownTimer expiresAt={listing.expiresAt} />
            </div>
          )}

          {/* CTA */}
          {!isOwner && !isUnavailable && (
            <ClaimButton
              listingId={listing.id}
              existingClaim={userClaim ?? null}
              isSignedIn={!!session}
            />
          )}

          {isOwner && (
            <div className="text-sm text-brand-muted border border-brand-border rounded-lg px-4 py-3">
              This is your listing. {listing._count.claims} person{listing._count.claims !== 1 ? 's' : ''} claimed it.
            </div>
          )}

          {/* Sharer info */}
          <div className="mt-auto pt-6 border-t border-brand-border flex items-center gap-3">
            {listing.user.image ? (
              <Image
                src={listing.user.image}
                alt={listing.user.name ?? ''}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-warm flex items-center justify-center text-sm font-medium">
                {listing.user.name?.[0] ?? '?'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{listing.user.name}</p>
              <p className="text-xs text-brand-muted">
                ★ {listing.user.karmaScore.toFixed(1)} · {listing.user.totalShares} shares
                {listing.user.neighborhood && ` · ${listing.user.neighborhood}`}
              </p>
            </div>
            <span className="ml-auto text-xs text-brand-muted">
              {formatDistanceToNow(listing.createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
