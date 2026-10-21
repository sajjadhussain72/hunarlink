import { ResetPasswordForm } from "@/components/reset-password-form";
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  return (
    <main className="min-h-screen bg-[#f7faf6] px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold text-[#2f765b]">HunarLink Admin</p>
        <h1 className="mt-3 text-3xl font-black text-[#153443]">
          Create New Admin Password
        </h1>
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
