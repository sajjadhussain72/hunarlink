import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
export default function CustomersPage() {
  return (
    <AdminShell>
      <p className="text-sm font-bold text-[#c47b13]">
        Relationship management
      </p>
      <h2 className="mt-2 text-4xl font-black">Customers</h2>
      <p className="mt-3 max-w-2xl text-[#60757b]">
        Customer records are created when people book HunarLink services. Open
        requests and conversations to manage each relationship.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/service-requests"
          className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm"
        >
          <h3 className="font-black">Customer bookings</h3>
          <p className="mt-2 text-sm text-[#60757b]">
            See customer name, email, location, request details, urgency, and
            current status.
          </p>
          <span className="mt-5 inline-block text-sm font-black text-[#2f765b]">
            Open requests →
          </span>
        </Link>
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
            Open messages →
          </span>
        </Link>
      </div>
    </AdminShell>
  );
}
