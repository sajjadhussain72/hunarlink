import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { managedConversation, managedMessage } from '@/lib/db/managed-schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname || !pathname.startsWith('chat-audio/')) return NextResponse.json({ error: 'Audio not found.' }, { status: 404 })
  const [message] = await db.select({ customerId: managedConversation.customerId }).from(managedMessage).innerJoin(managedConversation, eq(managedConversation.id, managedMessage.conversationId)).where(eq(managedMessage.audioPath, pathname)).limit(1)
  const isStaff = ['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')
  if (!message || (!isStaff && message.customerId !== session.user.id)) return NextResponse.json({ error: 'Audio not found.' }, { status: 404 })
  const result = await get(pathname, { access: 'private' })
  if (!result) return NextResponse.json({ error: 'Audio not found.' }, { status: 404 })
  return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType ?? 'application/octet-stream', 'Cache-Control': 'private, no-cache', ETag: result.blob.etag } })
}
