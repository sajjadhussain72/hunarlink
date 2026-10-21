import { AdminShell } from "@/components/admin-shell";
export default function ProfessionalsPage() {
  return (
    <AdminShell>
      <div>
        <p className="text-sm font-bold text-[#c47b13]">Network management</p>
        <h2 className="mt-2 text-4xl font-black">Professionals</h2>
        <p className="mt-3 text-[#60757b]">
          Review verification, availability, skills, performance, and
          assignments from one place.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          [
            "Pending verification",
            "Review new applications",
            "/professional/register",
          ],
          [
            "Active network",
            "Verified professionals ready for assignment",
            "/professional/dashboard",
          ],
          [
            "Assignments",
            "Match professionals to service requests",
            "/admin/service-requests",
          ],
        ].map(([title, body, href]) => (
          <a
            key={title}
            href={href}
            className="rounded-2xl border border-[#dbe7e0] bg-white p-6 shadow-sm"
          >
            <h3 className="font-black">{title}</h3>
            <p className="mt-2 text-sm text-[#60757b]">{body}</p>
            <span className="mt-5 inline-block text-sm font-black text-[#2f765b]">
              Open →
            </span>
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
