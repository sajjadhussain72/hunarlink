import Link from "next/link";

export default function AdminPage() {
  return (
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
  );
}
