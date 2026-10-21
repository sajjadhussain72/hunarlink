"use client";
import { useState } from "react";
import Link from "next/link";
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to send the reset email.");
        return;
      }
      setSent(true);
    } catch {
      setError("Unable to contact the recovery service. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#f7faf6] px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold text-[#2f765b]">HunarLink Admin</p>
        <h1 className="mt-3 text-3xl font-black text-[#153443]">
          Forgot Admin Password?
        </h1>
        {sent ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-xl bg-[#edf7ef] p-4 text-sm text-[#315a43]">
              If an account exists with this email, a password reset link has
              been sent. Check your inbox and spam folder.
            </p>
            <Link
              href="/admin-login"
              className="block text-center font-bold text-[#2f765b]"
            >
              Back to Admin Login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <label className="block text-sm font-bold text-[#153443]">
              Admin Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d5e2dc] px-4 py-3"
              />
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-[#fff0ed] p-4 text-sm text-[#9a3d32]"
              >
                {error}
              </p>
            )}
            <button
              disabled={pending}
              className="w-full rounded-xl bg-[#153443] px-4 py-3 font-black text-white disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send Reset Link"}
            </button>
            <Link
              href="/admin-login"
              className="block text-center text-sm font-bold text-[#60757b]"
            >
              Back to Admin Login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
