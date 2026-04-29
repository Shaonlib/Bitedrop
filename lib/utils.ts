import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, isPast } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatExpiry(date: Date): string {
  if (isPast(date)) return 'Expired'
  return `${formatDistanceToNow(date)} left`
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function categoryEmoji(category: string): string {
  const map: Record<string, string> = {
    MEALS: '🍽',
    BAKED_GOODS: '🥖',
    PRODUCE: '🥦',
    DAIRY: '🧀',
    BEVERAGES: '☕',
    SNACKS: '🍿',
    OTHER: '📦',
  }
  return map[category] ?? '📦'
}
