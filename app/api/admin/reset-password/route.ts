import { createHash } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { account, adminPasswordReset, session } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'

const hash = (value: string) => createHash('sha256').update(value).digest('hex')
export async function POST(request: Request) {
  try {
    const body = await request.json() as { token?: string; password?: string }
    if (!body.token || !body.password || body.password.length < 10 || !/[A-Z]/.test(body.password) || !/[0-9]/.test(body.password)) return NextResponse.json({ error: 'Use at least 10 characters with one uppercase letter and one number.' }, { status: 400 })
    const [reset] = await db.select().from(adminPasswordReset).where(and(eq(adminPasswordReset.tokenHash, hash(body.token)), gt(adminPasswordReset.expiresAt, new Date()), isNull(adminPasswordReset.usedAt))).limit(1)
    if (!reset) return NextResponse.json({ error: 'This reset link is invalid or expired.' }, { status: 400 })
    const passwordHash = await bcrypt.hash(body.password, 12)
    const updated = await db.transaction(async (tx) => {
      const [credential] = await tx.select({ id: account.id }).from(account).where(and(eq(account.userId, reset.userId), eq(account.providerId, 'credential'))).limit(1)
      if (!credential) return false
      await tx.update(account).set({ password: passwordHash, updatedAt: new Date() }).where(eq(account.id, credential.id))
      await tx.update(adminPasswordReset).set({ usedAt: new Date() }).where(eq(adminPasswordReset.id, reset.id))
      await tx.delete(session).where(eq(session.userId, reset.userId))
      return true
    })
    if (!updated) return NextResponse.json({ error: 'This Admin account is not ready for password reset. Contact support.' }, { status: 409 })
    return NextResponse.json({ ok: true })
  } catch { return NextResponse.json({ error: 'Unable to reset password.' }, { status: 500 }) }
}
