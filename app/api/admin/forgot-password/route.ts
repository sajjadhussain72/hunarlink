import { createHash, randomBytes } from "node:crypto";
import { eq, and, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, adminPasswordReset } from "@/lib/db/schema";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const baseUrl = () =>
  process.env.BETTER_AUTH_URL
    ? process.env.BETTER_AUTH_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.V0_RUNTIME_URL ?? "http://localhost:3000");

export async function POST(request: Request) {
  const generic = {
    message:
      "If an account exists with this email, a password reset link has been sent.",
  };
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) return NextResponse.json(generic);
    const [account] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(
        and(
          ilike(user.email, email),
          sql`upper(${user.role}) in ('ADMIN', 'SUPER_ADMIN')`,
        ),
      )
      .limit(1);
    if (!account) return NextResponse.json(generic);
    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db
      .delete(adminPasswordReset)
      .where(eq(adminPasswordReset.userId, account.id));
    await db
      .insert(adminPasswordReset)
      .values({ userId: account.id, tokenHash: hash(rawToken), expiresAt });
    const resetUrl = `${baseUrl()}/admin/reset-password?token=${encodeURIComponent(rawToken)}`;
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const sender = process.env.RESEND_FROM_EMAIL?.trim();
    if (!apiKey || !sender) {
      console.error(
        "[v0] Password reset email is not configured: RESEND_API_KEY and RESEND_FROM_EMAIL are required",
      );
      return NextResponse.json(
        {
          error:
            "Password recovery email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in the server environment.",
        },
        { status: 503 },
      );
    }
    if (apiKey) {
      const response = await fetch(
        process.env.RESEND_API_URL ?? "https://api.resend.com/emails",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: [email],
            subject: "HunarLink Admin Password Reset",
            html: `<div style="font-family:Arial;max-width:560px;margin:auto"><h2 style="color:#153443">HunarLink Admin</h2><p>A password reset was requested for your Admin CRM account.</p><p><a href="${resetUrl}" style="background:#153443;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Reset Admin Password</a></p><p>This link expires in 15 minutes and can only be used once.</p><p>If you did not request this, you can safely ignore this email.</p></div>`,
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) {
        console.error(
          "[v0] Password reset email failed:",
          response.status,
          await response.text(),
        );
        return NextResponse.json(
          {
            error:
              "The reset email could not be delivered. Please try again later.",
          },
          { status: 502 },
        );
      }
    } else {
      console.error(
        "[v0] Password reset email is not configured: RESEND_API_KEY is missing",
      );
      return NextResponse.json(
        {
          error:
            "Password recovery email is not configured. Set RESEND_API_KEY in the server environment before requesting a reset.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(generic);
  } catch (error) {
    console.error(
      "[v0] Password recovery request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { error: "Unable to process password recovery right now." },
      { status: 500 },
    );
  }
}
