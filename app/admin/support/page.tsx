import Link from "next/link";
export default function SupportPage() {
  return (
    <div suppressHydrationWarning>
      <p className="text-sm font-bold text-[#c47b13]">Customer care</p>
      <h2 className="mt-2 text-4xl font-black">Support tickets</h2>
      <p className="mt-3 max-w-2xl text-[#60757b]">
        Handle complaints, reschedules, and customer questions.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/conversations"
          className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm"
        >
          <h3 className="font-black">Client communication</h3>
          <p className="mt-2 text-sm text-[#60757b]">
            Reply to clients directly through HunarLink without exposing
            professional contact details.
          </p>
          <span className="mt-5 inline-block text-sm font-black text-[#2f765b]">
            Open client inbox
          </span>
        </Link>
      </div>
    </div>
  );
}
