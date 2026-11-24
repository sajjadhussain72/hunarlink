import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminRequestBoard } from "@/components/admin-request-board";

export default function AdminServiceRequestsPage() {
  return (
    <div className="mx-auto max-w-5xl" suppressHydrationWarning>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
      >
        <ArrowLeft data-icon="inline-start" /> HunarLink home
      </Link>
      <div className="mt-8">
        <p className="text-sm font-bold text-[#c47b13]">Service operations</p>
        <h2 className="mt-2 text-4xl font-black">Service requests</h2>
        <p className="mt-3 max-w-2xl text-[#60757b]">
          Review incoming service requests, assign professionals, and track
          delivery.
        </p>
      </div>
      <div className="mt-8 rounded-2xl border border-[#e3ece7] bg-white p-6">
        <AdminRequestBoard />
      </div>
    </div>
  );
}
