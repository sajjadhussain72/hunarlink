import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Headphones,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { requireProfessional } from "@/lib/auth/staff";
import { getProfessionalAssignments } from "@/app/actions/service-assignments";
import { SupportChat } from "@/components/support-chat";
import { db } from "@/lib/db";
import { workerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfessionalDashboard() {
  const user = await requireProfessional();
  const assignmentsResult = await getProfessionalAssignments();

  const assignments = assignmentsResult.ok ? assignmentsResult.assignments : [];

  // Get worker profile to check verification status
  const [workerProf] = await db
    .select()
    .from(workerProfile)
    .where(eq(workerProfile.userId, user.id))
    .limit(1);

  const isVerified = workerProf?.verificationStatus === "VERIFIED";
  const isPending = workerProf?.verificationStatus === "PENDING";
  const isRejected = workerProf?.verificationStatus === "REJECTED";

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.assignment.status === "ASSIGNED").length,
    inProgress: assignments.filter((a) => a.assignment.status === "IN_PROGRESS").length,
    completed: assignments.filter((a) => a.assignment.status === "COMPLETED").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-[#eaf5f0] text-[#2f765b]";
      case "ACCEPTED":
        return "bg-[#e8f4fd] text-[#2563eb]";
      case "IN_PROGRESS":
        return "bg-[#fff5df] text-[#9a6410]";
      case "COMPLETED":
        return "bg-[#eaf5f0] text-[#2f765b]";
      case "REJECTED":
        return "bg-[#fee2e2] text-[#dc2626]";
      case "CANCELLED":
        return "bg-[#f5f5f5] text-[#60757b]";
      default:
        return "bg-[#f5f5f5] text-[#60757b]";
    }
  };

  const getActionButtons = (status: string, assignmentId: string) => {
    switch (status) {
      case "ASSIGNED":
        return (
          <Link
            href={`/professional/assignment/${assignmentId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f765b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#256b4f]"
          >
            View Details
          </Link>
        );
      case "ACCEPTED":
        return (
          <Link
            href={`/professional/assignment/${assignmentId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f765b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#256b4f]"
          >
            Start Work
          </Link>
        );
      case "IN_PROGRESS":
        return (
          <Link
            href={`/professional/assignment/${assignmentId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2f765b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#256b4f]"
          >
            Mark Complete
          </Link>
        );
      case "COMPLETED":
        return (
          <span className="text-sm font-bold text-[#2f765b]">Completed</span>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]" suppressHydrationWarning>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
        >
          <ArrowLeft data-icon="inline-start" /> HunarLink home
        </Link>
        <section className="mt-8 rounded-3xl bg-[#153443] p-8 text-white md:p-12">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#f5b841]">
            Professional operations
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.04em]">
            Welcome{user.name ? `, ${user.name}` : ""}.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/70">
            HunarLink sends managed service assignments to verified
            professionals. Your customer relationship and pricing are managed by
            HunarLink.
          </p>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
            <BriefcaseBusiness className="text-[#c47b13]" />
            <p className="mt-4 text-3xl font-bold">{stats.total}</p>
            <h2 className="mt-1 font-bold">Total Assignments</h2>
          </div>
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
            <Clock className="text-[#c47b13]" />
            <p className="mt-4 text-3xl font-bold">{stats.pending}</p>
            <h2 className="mt-1 font-bold">Pending</h2>
          </div>
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
            <BriefcaseBusiness className="text-[#c47b13]" />
            <p className="mt-4 text-3xl font-bold">{stats.inProgress}</p>
            <h2 className="mt-1 font-bold">In Progress</h2>
          </div>
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
            <CheckCircle2 className="text-[#c47b13]" />
            <p className="mt-4 text-3xl font-bold">{stats.completed}</p>
            <h2 className="mt-1 font-bold">Completed</h2>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Assigned Work</h2>
          {assignments.length === 0 ? (
            <div className="mt-6 text-center text-sm text-[#60757b]">
              No assignments yet. Check back after staff review.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {assignments.map(({ assignment, request }) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-[#e3ece7] bg-[#fbfcfa] p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {assignment.status === "ASSIGNED" && (
                          <span className="rounded-full bg-[#f5b841] px-2 py-0.5 text-xs font-bold text-[#153443]">
                            NEW
                          </span>
                        )}
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(assignment.status)}`}>
                          {assignment.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <h3 className="mt-3 font-bold text-[#153443]">
                        {request.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#60757b]">
                        {request.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-bold text-[#60757b]">
                          {request.urgency}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#60757b]">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          <span>{request.address}</span>
                        </div>
                        {assignment.scheduledDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>
                              {new Date(assignment.scheduledDate).toLocaleDateString()}
                              {assignment.scheduledTime && ` at ${assignment.scheduledTime}`}
                            </span>
                          </div>
                        )}
                      </div>
                      {assignment.notes && (
                        <p className="mt-2 text-xs text-[#60757b]">
                          <strong>Note:</strong> {assignment.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {getActionButtons(assignment.status, assignment.id)}
                      <span className="text-xs text-[#60757b]">
                        Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
            <Headphones className="text-[#c47b13]" />
            <h2 className="mt-5 font-bold">Contact HunarLink</h2>
            <p className="mt-2 text-sm text-[#60757b]">
              Need a change or have a question?
            </p>
          </div>
          <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
            {isVerified ? (
              <>
                <ShieldCheck className="text-[#2f765b]" />
                <h2 className="mt-5 font-bold">Verification Status</h2>
                <p className="mt-2 text-sm text-[#60757b]">
                  Your profile is verified and approved.
                </p>
              </>
            ) : isPending ? (
              <>
                <AlertCircle className="text-[#c47b13]" />
                <h2 className="mt-5 font-bold">Verification Status</h2>
                <p className="mt-2 text-sm text-[#60757b]">
                  Your profile is under review. You will receive assignments once approved.
                </p>
              </>
            ) : isRejected ? (
              <>
                <AlertCircle className="text-[#dc2626]" />
                <h2 className="mt-5 font-bold">Verification Status</h2>
                <p className="mt-2 text-sm text-[#60757b]">
                  Your profile was not approved. Please contact HunarLink for more information.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="text-[#dc2626]" />
                <h2 className="mt-5 font-bold">Verification Status</h2>
                <p className="mt-2 text-sm text-[#60757b]">
                  No professional profile found. Please complete your profile.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Chat with HunarLink</h2>
          <div className="mt-4">
            <SupportChat />
          </div>
        </div>
      </div>
    </main>
  );
}
