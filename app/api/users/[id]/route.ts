import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, image: true, bio: true,
      neighborhood: true, karmaScore: true, totalShares: true, createdAt: true,
      listings: {
        where: { status: 'AVAILABLE', expiresAt: { gt: new Date() } },
        select: { id: true, title: true, category: true, servings: true, expiresAt: true },
        take: 5,
      },
      reviewsReceived: {
        select: { rating: true, comment: true, createdAt: true, author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.id !== params.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const allowed = ['name', 'bio', 'neighborhood', 'image']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const user = await prisma.user.update({ where: { id: params.id }, data })
  return NextResponse.json(user)
}
