import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role ?? '')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: 'Upload a JPG, PNG, or WebP image under 8 MB.' }, { status: 400 })
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-')
  const blob = await put(`hunarlink/projects/${crypto.randomUUID()}-${safeName}`, file, { access: 'public', addRandomSuffix: false })
  return NextResponse.json({ url: blob.url })
}
