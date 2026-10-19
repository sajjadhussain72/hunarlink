import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

const allowedTypes = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'])
const extensionFor = (type: string) => type === 'audio/ogg' ? 'ogg' : type === 'audio/mp4' ? 'mp4' : type === 'audio/mpeg' ? 'mp3' : 'webm'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  const normalizedType = file instanceof File ? file.type.split(';')[0] : ''
  if (!(file instanceof File) || !allowedTypes.has(normalizedType) || file.size === 0 || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Use a supported audio recording up to 10 MB.' }, { status: 400 })
  }
  const type = file.type.split(';')[0]
  const blob = await put(`chat-audio/${session.user.id}/${crypto.randomUUID()}.${extensionFor(type)}`, file, { access: 'private', contentType: type, addRandomSuffix: false })
  return NextResponse.json({ pathname: blob.pathname })
}
