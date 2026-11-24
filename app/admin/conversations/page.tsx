import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSupportChat } from "@/components/admin-support-chat";

export default function AdminConversationsPage() {
  return (
    <div className="mx-auto max-w-6xl" suppressHydrationWarning>
      <Link
        href="/admin/service-requests"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
      >
        <ArrowLeft data-icon="inline-start" /> Back to service requests
      </Link>
      <div className="mt-8">
        <p className="text-sm font-bold text-[#c47b13]">Client inbox</p>
        <h2 className="mt-2 text-4xl font-black">Conversations</h2>
        <p className="mt-3 max-w-2xl text-[#60757b]">
          View and respond to customer messages across all service requests.
        </p>
      </div>
      <div className="mt-8 rounded-2xl border border-[#e3ece7] bg-white p-6">
        <AdminSupportChat />
      </div>
    </div>
  );
}
