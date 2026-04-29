import Link from 'next/link'
import Image from 'next/image'
import { categoryEmoji, formatExpiry } from '@/lib/utils'
import { MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    category: string
    servings: number
    imageUrl: string | null
    address: string | null
    expiresAt: Date
    status: string
    isVegan: boolean
    isGlutenFree: boolean
    user: {
      id: string
      name: string | null
      image: string | null
      karmaScore: number
      neighborhood: string | null
    }
    _count: { claims: number }
  }
  showStatus?: boolean
}

export function ListingCard({ listing, showStatus }: ListingCardProps) {
  const isExpired = listing.expiresAt < new Date()
  const isUnavailable = listing.status !== 'AVAILABLE' || isExpired
  const expiryText = formatExpiry(listing.expiresAt)

  // Color the expiry text red when under 1 hour
  const msLeft = listing.expiresAt.getTime() - Date.now()
  const urgentExpiry = msLeft < 60 * 60 * 1000 && msLeft > 0

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        'group flex flex-col border border-brand-border rounded-xl overflow-hidden hover:border-brand-dark/30 transition-all hover:shadow-sm bg-white',
        isUnavailable && 'opacity-60'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-brand-warm">
        {listing.imageUrl ? (
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            {categoryEmoji(listing.category)}
          </div>
        )}

        {/* Status badge */}
        {showStatus && isUnavailable && (
          <div className="absolute top-2 left-2 font-mono text-[10px] tracking-widest uppercase bg-brand-dark/80 text-white px-2 py-0.5 rounded">
            {isExpired ? 'Expired' : listing.status.toLowerCase()}
          </div>
        )}

        {/* Diet badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {listing.isVegan && (
            <span className="text-[9px] font-mono uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
              Vegan
            </span>
          )}
          {listing.isGlutenFree && (
            <span className="text-[9px] font-mono uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              GF
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        <p className="font-mono text-[10px] tracking-wider uppercase text-brand-muted mb-1">
          {listing.category.replace('_', ' ')}
        </p>
        <h3 className="font-medium text-sm leading-snug text-brand-dark mb-2 line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-brand-muted mt-auto">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {listing.servings} srv
          </span>
          {listing.address && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} />
              {listing.user.neighborhood ?? listing.address}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-brand-border">
          <div className="flex items-center gap-1.5">
            {listing.user.image ? (
              <Image
                src={listing.user.image}
                alt={listing.user.name ?? ''}
                width={18}
                height={18}
                className="rounded-full"
              />
            ) : (
              <div className="w-[18px] h-[18px] rounded-full bg-brand-warm flex items-center justify-center text-[9px]">
                {listing.user.name?.[0] ?? '?'}
              </div>
            )}
            <span className="text-xs text-brand-muted truncate max-w-[80px]">{listing.user.name}</span>
          </div>
          <span
            className={cn(
              'font-mono text-[10px]',
              urgentExpiry ? 'text-red-500 font-medium' : 'text-brand-muted'
            )}
          >
            {expiryText}
          </span>
        </div>
      </div>
    </Link>
  )
}
