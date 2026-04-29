'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function createListing(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('You must be signed in to share food.')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const servings = Number(formData.get('servings'))
  const category = formData.get('category') as string
  const address = formData.get('address') as string
  const lat = Number(formData.get('lat') || 64.1355)
  const lng = Number(formData.get('lng') || -21.8954)
  const expiresHours = Number(formData.get('expiresHours') || 8)
  const imageUrl = formData.get('imageUrl') as string | null
  const isVegan = formData.get('isVegan') === 'true'
  const isGlutenFree = formData.get('isGlutenFree') === 'true'
  const allergens = formData.get('allergens') as string | null

  if (!title || !servings || servings < 1) {
    throw new Error('Please fill in all required fields.')
  }

  const expiresAt = new Date(Date.now() + expiresHours * 60 * 60 * 1000)

  const listing = await prisma.listing.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      servings,
      category: category as any,
      address: address?.trim() || null,
      lat,
      lng,
      expiresAt,
      imageUrl: imageUrl || null,
      isVegan,
      isGlutenFree,
      allergens: allergens?.trim() || null,
      userId: session.user.id,
    },
  })

  // Update user's share count
  await prisma.user.update({
    where: { id: session.user.id },
    data: { totalShares: { increment: 1 } },
  })

  revalidatePath('/')
  redirect(`/listings/${listing.id}`)
}

export async function claimListing(listingId: string, message?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Sign in to claim food.')

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true, status: true, expiresAt: true, title: true },
  })

  if (!listing) throw new Error('Listing not found.')
  if (listing.status !== 'AVAILABLE') throw new Error('This item is no longer available.')
  if (listing.expiresAt < new Date()) throw new Error('This listing has expired.')
  if (listing.userId === session.user.id) throw new Error("You can't claim your own listing.")

  // Upsert claim (idempotent)
  const claim = await prisma.claim.upsert({
    where: { listingId_userId: { listingId, userId: session.user.id } },
    update: { status: 'PENDING', message: message ?? null },
    create: { listingId, userId: session.user.id, status: 'PENDING', message: message ?? null },
  })

  // Notify the listing owner
  await prisma.notification.create({
    data: {
      userId: listing.userId,
      type: 'NEW_CLAIM',
      message: `Someone wants your "${listing.title}"`,
      linkUrl: `/listings/${listingId}`,
    },
  })

  revalidatePath(`/listings/${listingId}`)
  return claim
}

export async function cancelClaim(listingId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Not authenticated.')

  await prisma.claim.delete({
    where: { listingId_userId: { listingId, userId: session.user.id } },
  })

  revalidatePath(`/listings/${listingId}`)
}

export async function deleteListing(listingId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Not authenticated.')

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  })

  if (listing?.userId !== session.user.id) throw new Error('Not authorized.')

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'DELETED' },
  })

  revalidatePath('/')
  redirect('/')
}

export async function markListingGone(listingId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Not authenticated.')

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  })

  if (listing?.userId !== session.user.id) throw new Error('Not authorized.')

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'CLAIMED' },
  })

  revalidatePath(`/listings/${listingId}`)
  revalidatePath('/')
}
