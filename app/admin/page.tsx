import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";

const cards = [
  [
    "New service requests",
    "Review and move bookings through delivery.",
    "/admin/service-requests",
    "Open requests",
  ],
  [
    "Client messages",
    "Reply to customers and track conversations.",
    "/admin/conversations",
    "Open inbox",
  ],
  [
    "Professionals",
    "Manage the HunarLink delivery network.",
    "/admin/professionals",
    "Manage professionals",
  ],
  [
    "Support tickets",
    "Handle complaints, reschedules, and questions.",
    "/admin/support",
    "Open support",
  ],
];
export default function AdminPage() {
  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[#c47b13]">Today at HunarLink</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Good morning, team.
          </h2>
          <p className="mt-3 max-w-2xl text-[#60757b]">
            A calm workspace for every booking, conversation, and service in
            motion.
          </p>
        </div>
        <Link
          href="/admin/service-requests"
          className="inline-flex h-fit items-center justify-center rounded-xl bg-[#f5b841] px-5 py-3 font-black text-[#153443] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          Review bookings <span className="ml-2">→</span>
        </Link>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#60757b]">
            Open requests
          </p>
          <p className="mt-2 text-3xl font-black">Today</p>
          <p className="mt-1 text-xs font-bold text-[#2f765b]">
            Ready for review
          </p>
        </div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#60757b]">
            Client inbox
          </p>
          <p className="mt-2 text-3xl font-black">Live</p>
          <p className="mt-1 text-xs font-bold text-[#2f765b]">
            Messages stay organized
          </p>
        </div>
        <div className="rounded-2xl border border-[#dbe7e0] bg-[#153443] p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">
            Team status
          </p>
          <p className="mt-2 text-3xl font-black">Online</p>
          <p className="mt-1 text-xs font-bold text-[#f5b841]">
            Operations are running
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map(([title, description, href, action]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h3 className="text-lg font-black">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#60757b]">
              {description}
            </p>
            <span className="mt-6 inline-block text-sm font-black text-[#2f765b]">
              {action} →
            </span>
          </Link>
        ))}
      </div>
      <section className="mt-8 rounded-2xl border border-[#dbe7e0] bg-white p-6">
        <h3 className="font-black">Daily workflow</h3>
        <div className="mt-5 grid gap-4 text-sm md:grid-cols-4">
          <div>
            <b>1. Receive</b>
            <p className="mt-1 text-[#60757b]">
              Bookings arrive from the customer flow.
            </p>
          </div>
          <div>
            <b>2. Review</b>
            <p className="mt-1 text-[#60757b]">
              Check urgency, location, and client details.
            </p>
          </div>
          <div>
            <b>3. Assign</b>
            <p className="mt-1 text-[#60757b]">
              Choose a verified professional for the job.
            </p>
          </div>
          <div>
            <b>4. Deliver</b>
            <p className="mt-1 text-[#60757b]">
              Track status, payment, invoice, and feedback.
            </p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
