import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(50, Number(searchParams.get('limit') ?? 20))
  const q = searchParams.get('q')
  const category = searchParams.get('category')

  const where = {
    status: 'AVAILABLE' as const,
    expiresAt: { gt: new Date() },
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
    ...(category && { category: category as any }),
  }

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, image: true, karmaScore: true } },
        _count: { select: { claims: true } },
      },
      orderBy: { expiresAt: 'asc' },
    }),
    prisma.listing.count({ where }),
  ])

  return NextResponse.json({
    listings,
    total,
    page,
    pages: Math.ceil(total / limit),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, servings, category, address, lat, lng, expiresAt, imageUrl, isVegan, isGlutenFree, allergens } = body

    if (!title || !servings || !lat || !lng || !expiresAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        servings: Number(servings),
        category: category ?? 'OTHER',
        address: address?.trim() || null,
        lat: Number(lat),
        lng: Number(lng),
        expiresAt: new Date(expiresAt),
        imageUrl: imageUrl || null,
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
        allergens: allergens?.trim() || null,
        userId: session.user.id,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalShares: { increment: 1 } },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error('POST /api/listings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
