'use server'

import { and, asc, desc, eq, isNull } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { headers } from 'next/headers'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { managedConversation, managedMessage } from '@/lib/db/managed-schema'

const messageSchema = z.object({ conversationId: z.string().uuid().optional(), body: z.string().trim().min(1, 'Write a message first.').max(2000) })
const voiceMessageSchema = z.object({ conversationId: z.string().uuid(), audioPath: z.string().trim().min(1).max(500), durationSeconds: z.number().int().min(1).max(600) })
const deleteMessageSchema = z.object({ messageId: z.string().uuid(), scope: z.enum(['ONLY_ME', 'EVERYONE']) })

async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

async function getCustomerId() {
  return (await getSessionUser())?.id ?? null
}

async function requireStaff() {
  const currentUser = await getSessionUser()
  if (!currentUser) return null
  const [staff] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.id, currentUser.id)).limit(1)
  return staff && ['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(staff.role) ? staff : null
}

export async function getSupportConversation() {
  const customerId = await getCustomerId()
  if (!customerId) return { ok: false as const, message: 'Please sign in to contact HunarLink.' }
  let [conversation] = await db.select().from(managedConversation).where(eq(managedConversation.customerId, customerId)).orderBy(asc(managedConversation.createdAt)).limit(1)
  if (!conversation) [conversation] = await db.insert(managedConversation).values({ customerId, subject: 'HunarLink Support' }).returning()
  const messages = await db.select().from(managedMessage).where(and(eq(managedMessage.conversationId, conversation.id), eq(managedMessage.deletedForCustomer, false))).orderBy(asc(managedMessage.createdAt))
  return { ok: true as const, conversation, messages }
}

export async function sendSupportMessage(input: z.infer<typeof messageSchema>) {
  const parsed = messageSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? 'Please check your message.' }
  const customerId = await getCustomerId()
  if (!customerId) return { ok: false as const, message: 'Please sign in to contact HunarLink.' }
  let conversationId = parsed.data.conversationId
  if (conversationId) {
    const [owned] = await db.select({ id: managedConversation.id }).from(managedConversation).where(and(eq(managedConversation.id, conversationId), eq(managedConversation.customerId, customerId))).limit(1)
    if (!owned) return { ok: false as const, message: 'That conversation is not available.' }
  } else {
    const [conversation] = await db.insert(managedConversation).values({ customerId, subject: 'HunarLink Support' }).returning({ id: managedConversation.id })
    conversationId = conversation.id
  }
  const [message] = await db.insert(managedMessage).values({ conversationId, senderId: customerId, senderRole: 'CUSTOMER', body: parsed.data.body }).returning()
  await db.update(managedConversation).set({ updatedAt: new Date() }).where(and(eq(managedConversation.id, conversationId), eq(managedConversation.customerId, customerId)))
  return { ok: true as const, message }
}

export async function getAdminConversations() {
  const staff = await requireStaff()
  if (!staff) return { ok: false as const, message: 'You do not have permission to view support conversations.' }
  const conversations = await db.select({ conversation: managedConversation, customerName: user.name, customerEmail: user.email }).from(managedConversation).innerJoin(user, eq(user.id, managedConversation.customerId)).orderBy(desc(managedConversation.updatedAt))
  const items = await Promise.all(conversations.map(async (item) => ({ ...item, messages: await db.select().from(managedMessage).where(and(eq(managedMessage.conversationId, item.conversation.id), eq(managedMessage.deletedForStaff, false))).orderBy(asc(managedMessage.createdAt)) })))
  return { ok: true as const, items }
}

export async function sendVoiceMessage(input: z.infer<typeof voiceMessageSchema>) {
  const parsed = voiceMessageSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: 'That voice message is not valid.' }
  const customerId = await getCustomerId()
  if (!customerId) return { ok: false as const, message: 'Please sign in to send a voice message.' }
  const [conversation] = await db.select({ id: managedConversation.id }).from(managedConversation).where(and(eq(managedConversation.id, parsed.data.conversationId), eq(managedConversation.customerId, customerId))).limit(1)
  if (!conversation) return { ok: false as const, message: 'That conversation is not available.' }
  const [message] = await db.insert(managedMessage).values({ conversationId: conversation.id, senderId: customerId, senderRole: 'CUSTOMER', body: 'Voice message', messageType: 'AUDIO', audioPath: parsed.data.audioPath, durationSeconds: parsed.data.durationSeconds }).returning()
  await db.update(managedConversation).set({ updatedAt: new Date() }).where(eq(managedConversation.id, conversation.id))
  return { ok: true as const, message }
}

export async function sendAdminMessage(input: z.infer<typeof messageSchema>) {
  const parsed = messageSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: parsed.error.issues[0]?.message ?? 'Please check your message.' }
  const staff = await requireStaff()
  if (!staff || !parsed.data.conversationId) return { ok: false as const, message: 'You do not have permission to send support messages.' }
  const [conversation] = await db.select({ id: managedConversation.id }).from(managedConversation).where(eq(managedConversation.id, parsed.data.conversationId)).limit(1)
  if (!conversation) return { ok: false as const, message: 'Conversation not found.' }
  const [message] = await db.insert(managedMessage).values({ conversationId: conversation.id, senderId: staff.id, senderRole: staff.role, body: parsed.data.body }).returning()
  await db.update(managedConversation).set({ updatedAt: new Date() }).where(eq(managedConversation.id, conversation.id))
  return { ok: true as const, message }
}

export async function sendAdminVoiceMessage(input: z.infer<typeof voiceMessageSchema>) {
  const parsed = voiceMessageSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, message: 'That voice message is not valid.' }
  const staff = await requireStaff()
  if (!staff) return { ok: false as const, message: 'You do not have permission to send support messages.' }
  const [conversation] = await db.select({ id: managedConversation.id }).from(managedConversation).where(eq(managedConversation.id, parsed.data.conversationId)).limit(1)
  if (!conversation) return { ok: false as const, message: 'Conversation not found.' }
  const [message] = await db.insert(managedMessage).values({ conversationId: conversation.id, senderId: staff.id, senderRole: staff.role, body: 'Voice message', messageType: 'AUDIO', audioPath: parsed.data.audioPath, durationSeconds: parsed.data.durationSeconds }).returning()
  await db.update(managedConversation).set({ updatedAt: new Date() }).where(eq(managedConversation.id, conversation.id))
  return { ok: true as const, message }
}

export async function deleteChatMessage(messageId: string, scope: 'ONLY_ME' | 'EVERYONE') {
  const parsed = deleteMessageSchema.safeParse({ messageId, scope })
  if (!parsed.success) return { ok: false as const, message: 'That message is not valid.' }
  const currentUser = await getSessionUser()
  if (!currentUser) return { ok: false as const, message: 'Please sign in again.' }
  const staff = await requireStaff()
  const [message] = await db.select({ message: managedMessage, conversation: managedConversation }).from(managedMessage).innerJoin(managedConversation, eq(managedConversation.id, managedMessage.conversationId)).where(eq(managedMessage.id, parsed.data.messageId)).limit(1)
  if (!message) return { ok: false as const, message: 'Message not found.' }
  const allowed = staff ? true : message.conversation.customerId === currentUser.id && message.message.senderId === currentUser.id
  if (!allowed) return { ok: false as const, message: 'You can only delete your own messages.' }
  if (parsed.data.scope === 'ONLY_ME') {
    await db.update(managedMessage).set(staff ? { deletedForStaff: true } : { deletedForCustomer: true }).where(eq(managedMessage.id, parsed.data.messageId))
  } else {
    if (!staff && message.message.senderId !== currentUser.id) return { ok: false as const, message: 'Only the sender or support staff can delete this for everyone.' }
    if (message.message.audioPath) { try { await del(message.message.audioPath) } catch (error) { console.error('[v0] Failed to delete chat audio:', error) } }
    await db.delete(managedMessage).where(eq(managedMessage.id, parsed.data.messageId))
  }
  return { ok: true as const, messageId: parsed.data.messageId }
}

export async function markSupportMessagesRead(conversationId: string) {
  const customerId = await getCustomerId()
  if (!customerId) return { ok: false as const }
  const [owned] = await db.select({ id: managedConversation.id }).from(managedConversation).where(and(eq(managedConversation.id, conversationId), eq(managedConversation.customerId, customerId))).limit(1)
  if (!owned) return { ok: false as const }
  await db.update(managedMessage).set({ readAt: new Date() }).where(and(eq(managedMessage.conversationId, conversationId), isNull(managedMessage.readAt)))
  return { ok: true as const }
}

export type SupportConversation = Awaited<ReturnType<typeof getSupportConversation>>
export type AdminConversations = Awaited<ReturnType<typeof getAdminConversations>>
