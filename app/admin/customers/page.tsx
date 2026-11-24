import Link from "next/link";

export default function CustomersPage() {
  return (
    <>
      <p className="text-sm font-bold text-[#c47b13]">
        Relationship management
      </p>
      <h2 className="mt-2 text-4xl font-black">Customers</h2>
      <p className="mt-3 max-w-2xl text-[#60757b]">
        View customer accounts, service history, and support interactions.
      </p>
      <div className="mt-8 rounded-2xl border border-[#e3ece7] bg-white p-8 text-center">
        <p className="text-sm text-[#60757b]">
          Customer management features coming soon.
        </p>
        <Link
          href="/admin/service-requests"
          className="mt-4 inline-block text-sm font-black text-[#2f765b]"
        >
          Open client inbox
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
    </>
  );
}
