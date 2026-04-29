import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: fetch notifications
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const stream = searchParams.get('stream') === 'true'

  // SSE streaming mode
  if (stream) {
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        // Send existing unread notifications immediately
        const notifications = await prisma.notification.findMany({
          where: { userId: session.user.id, read: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
        send({ type: 'init', notifications })

        // Poll every 10s for new notifications (stateless SSE — no WebSocket needed)
        const interval = setInterval(async () => {
          try {
            const latest = await prisma.notification.findMany({
              where: { userId: session.user.id, read: false },
              orderBy: { createdAt: 'desc' },
              take: 5,
            })
            send({ type: 'update', notifications: latest })
          } catch {
            clearInterval(interval)
            controller.close()
          }
        }, 10000)

        // Clean up when client disconnects
        req.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  // Regular JSON fetch
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(notifications)
}

// PATCH: mark all as read
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ success: true })
}
