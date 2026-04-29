import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
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

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(listing)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { userId: true },
  })

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (listing.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['title', 'description', 'servings', 'status', 'expiresAt', 'imageUrl', 'isVegan', 'isGlutenFree', 'allergens']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const updated = await prisma.listing.update({ where: { id: params.id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { userId: true },
  })

  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (listing.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.listing.update({ where: { id: params.id }, data: { status: 'DELETED' } })
  return NextResponse.json({ success: true })
}
