import Link from "next/link";
import { Avatar } from "@/components/commen";
import { CheckCircle2, AlertCircle, Users } from "lucide-react";
import {
  getPendingProfessionals,
  checkProfessionalApprovePermission,
} from "@/app/actions/professionals";
import { ProfessionalActions } from "./professional-actions";

export default async function ProfessionalsPage() {
  const professionalsResult = await getPendingProfessionals();
  const permissionResult = await checkProfessionalApprovePermission();

  const professionals = professionalsResult.ok ? professionalsResult.professionals : [];
  const hasApprovePermission = permissionResult.ok ? permissionResult.hasPermission : false;
  const error = professionalsResult.ok ? "" : professionalsResult.message;

  return (
    <div suppressHydrationWarning>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[#c47b13]">Network management</p>
          <h2 className="mt-2 text-4xl font-black">Professionals</h2>
          <p className="mt-3 max-w-2xl text-[#60757b]">
            Review and approve professional profiles to expand the HunarLink
            network.
          </p>
        </div>
        <Link
          href="/admin/professionals/all"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f765b] px-5 py-3 font-bold text-white transition hover:bg-[#256b4f]"
        >
          <Users className="size-5" />
          View All Professionals
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle className="mr-2 inline" />
          {error}
        </div>
      )}

      <div className="mt-8">
        {professionals.length === 0 ? (
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto size-12 text-[#2f765b]" />
            <h3 className="mt-4 text-lg font-bold text-[#153443]">All caught up</h3>
            <p className="mt-2 text-sm text-[#60757b]">No pending professional applications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {professionals.map(({ profile, user }) => (
              <div
                key={profile.id}
                className="rounded-2xl border border-[#e3ece7] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                    <Avatar
                      name={user.name}
                      image={user.image}
                      size="lg"
                      className="shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-[#153443]">{user.name}</h3>
                      <p className="text-sm text-[#60757b]">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-[#60757b]">{user.phone}</p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#eaf5f0] px-3 py-1 text-xs font-bold text-[#2f765b]">
                          {profile.profession}
                        </span>
                        <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-bold text-[#c47b13]">
                          {profile.verificationStatus}
                        </span>
                        <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-bold text-[#60757b]">
                          {profile.experienceYears} years experience
                        </span>
                      </div>
                      {profile.bio && (
                        <p className="mt-3 text-sm text-[#60757b]">{profile.bio}</p>
                      )}
                      {profile.hourlyRate && (
                        <p className="mt-2 text-sm text-[#60757b]">
                          Hourly rate: {profile.hourlyRate} PKR
                        </p>
                      )}
                      <p className="mt-2 text-xs text-[#60757b]">
                        Applied: {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {hasApprovePermission && (
                    <ProfessionalActions profileId={profile.id} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
