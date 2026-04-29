'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { claimListing, cancelClaim } from '@/app/actions/listing'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import type { Claim } from '@prisma/client'

interface Props {
  listingId: string
  existingClaim: Claim | null
  isSignedIn: boolean
}

export function ClaimButton({ listingId, existingClaim, isSignedIn }: Props) {
  const [isPending, startTransition] = useTransition()
  const [claimed, setClaimed] = useState(!!existingClaim)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)

  if (!isSignedIn) {
    return (
      <button
        onClick={() => signIn()}
        className="w-full py-3 bg-brand-dark text-brand-cream text-sm font-medium rounded-xl hover:opacity-80 transition-opacity"
      >
        Sign in to claim
      </button>
    )
  }

  const handleClaim = () => {
    startTransition(async () => {
      try {
        await claimListing(listingId, message || undefined)
        setClaimed(true)
        setShowMessage(false)
        toast.success('Claimed! The sharer will be notified.')
      } catch (err: any) {
        toast.error(err.message ?? 'Something went wrong')
      }
    })
  }

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelClaim(listingId)
        setClaimed(false)
        toast('Claim cancelled.')
      } catch {
        toast.error('Could not cancel claim.')
      }
    })
  }

  if (claimed) {
    return (
      <div className="space-y-2">
        <div className="w-full py-3 bg-green-50 text-green-700 text-sm font-medium rounded-xl text-center border border-green-200">
          ✓ You've claimed this
        </div>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="w-full py-2 text-xs text-brand-muted hover:text-brand-dark border border-brand-border rounded-lg transition-colors"
        >
          Cancel claim
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {showMessage && (
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional: say hi or ask about pickup details..."
          rows={2}
          className="w-full text-sm px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:border-brand-dark resize-none placeholder:text-brand-muted"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={handleClaim}
          disabled={isPending}
          className="flex-1 py-3 bg-brand-orange text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          I'll take this
        </button>
        <button
          onClick={() => setShowMessage((v) => !v)}
          className="px-3 py-3 border border-brand-border text-brand-muted hover:text-brand-dark hover:border-brand-dark text-sm rounded-xl transition-colors"
          title="Add a message"
        >
          💬
        </button>
      </div>
    </div>
  )
}
