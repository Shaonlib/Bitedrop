import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { listingId, targetId, rating, comment } = await req.json()

  if (!listingId || !targetId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Invalid review data' }, { status: 400 })
  }

  if (targetId === session.user.id) {
    return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 })
  }

  const review = await prisma.review.create({
    data: {
      listingId,
      authorId: session.user.id,
      targetId,
      rating: Number(rating),
      comment: comment?.trim() || null,
    },
  })

  // Recompute karma score for target user
  const reviews = await prisma.review.findMany({
    where: { targetId },
    select: { rating: true },
  })
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.user.update({
    where: { id: targetId },
    data: { karmaScore: Math.round(avg * 10) / 10 },
  })

  await prisma.notification.create({
    data: {
      userId: targetId,
      type: 'NEW_REVIEW',
      message: `You received a ${rating}-star review`,
      linkUrl: '/profile',
    },
  })

  return NextResponse.json(review, { status: 201 })
}
