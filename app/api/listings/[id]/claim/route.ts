import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Ctx { params: { id: string } }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { userId: true, status: true, expiresAt: true, title: true },
  })

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (listing.status !== 'AVAILABLE') return NextResponse.json({ error: 'Not available' }, { status: 409 })
  if (listing.expiresAt < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 410 })
  if (listing.userId === session.user.id) return NextResponse.json({ error: 'Cannot claim own listing' }, { status: 400 })

  const body = await req.json().catch(() => ({}))

  const claim = await prisma.claim.upsert({
    where: { listingId_userId: { listingId: params.id, userId: session.user.id } },
    update: { status: 'PENDING', message: body.message ?? null },
    create: { listingId: params.id, userId: session.user.id, status: 'PENDING', message: body.message ?? null },
  })

  await prisma.notification.create({
    data: {
      userId: listing.userId,
      type: 'NEW_CLAIM',
      message: `Someone wants your "${listing.title}"`,
      linkUrl: `/listings/${params.id}`,
    },
  })

  return NextResponse.json(claim, { status: 201 })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.claim.delete({
    where: { listingId_userId: { listingId: params.id, userId: session.user.id } },
  }).catch(() => null)

  return NextResponse.json({ success: true })
}
