'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  expiresAt: Date
}

function timeLeft(expiresAt: Date) {
  const ms = expiresAt.getTime() - Date.now()
  if (ms <= 0) return null

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds, ms }
}

export function CountdownTimer({ expiresAt }: Props) {
  const [time, setTime] = useState(() => timeLeft(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(timeLeft(expiresAt))
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (!time) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <Clock size={14} />
        <span className="font-mono">Expired</span>
      </div>
    )
  }

  const urgent = time.ms < 60 * 60 * 1000 // under 1 hour

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm font-mono',
        urgent ? 'text-red-500' : 'text-brand-muted'
      )}
    >
      <Clock size={14} className={urgent ? 'animate-pulse' : ''} />
      <span>
        {time.hours > 0 && `${time.hours}h `}
        {time.minutes}m {time.seconds}s remaining
      </span>
    </div>
  )
}
