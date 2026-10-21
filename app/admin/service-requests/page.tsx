import Link from "next/link";
import { ArrowLeft, ClipboardList, ShieldCheck } from "lucide-react";
import { AdminRequestBoard } from "@/components/admin-request-board";
import { AdminShell } from "@/components/admin-shell";

export default function AdminServiceRequestsPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
        >
          <ArrowLeft data-icon="inline-start" /> HunarLink home
        </Link>
        <div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm md:p-12">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5b841]">
            <ClipboardList />
          </div>
          <p className="mt-7 text-sm font-bold uppercase tracking-[.18em] text-[#c47b13]">
            Operations center
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.04em]">
            Service requests
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-[#60757b]">
            This operational workspace is ready for HunarLink staff. Requests
            submitted through Book a Service are persisted in the managed
            service database and are reviewed here for assignment.
          </p>
          <div className="mt-8 flex gap-3 rounded-2xl bg-[#f6faf7] p-4 text-sm text-[#60757b]">
            <ShieldCheck className="shrink-0 text-[#c47b13]" /> Access must be
            restricted to STAFF, ADMIN, or SUPER_ADMIN before production launch.
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/conversations"
              className="inline-flex rounded-xl border border-[#d5e2dc] px-5 py-3 font-bold text-[#153443]"
            >
              Open client messages
            </Link>
            <Link
              href="/book-service"
              className="inline-flex rounded-xl bg-[#153443] px-5 py-3 font-bold text-white"
            >
              View customer booking flow
            </Link>
          </div>
          <AdminRequestBoard />
        </div>
      </div>
    </AdminShell>
  );
}
