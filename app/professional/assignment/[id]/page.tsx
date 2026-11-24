import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { getProfessionalAssignments, updateAssignmentStatus } from "@/app/actions/service-assignments";
import { notFound } from "next/navigation";

export default async function AssignmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const assignmentsResult = await getProfessionalAssignments();

  if (!assignmentsResult.ok) {
    return (
      <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]" suppressHydrationWarning>
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-[#60757b]">Error loading assignments.</p>
        </div>
      </main>
    );
  }

  const assignment = assignmentsResult.assignments.find(
    (a) => a.assignment.id === params.id
  );

  if (!assignment) {
    notFound();
  }

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
      default:
        return "bg-[#f5f5f5] text-[#60757b]";
    }
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return [
          { action: "ACCEPTED", label: "Accept Work", color: "bg-[#2f765b] hover:bg-[#256b4f]" },
          { action: "REJECTED", label: "Decline", color: "bg-[#c84b4b] hover:bg-[#b03d3d]" },
        ];
      case "ACCEPTED":
        return [
          { action: "IN_PROGRESS", label: "Start Work", color: "bg-[#2f765b] hover:bg-[#256b4f]" },
        ];
      case "IN_PROGRESS":
        return [
          { action: "COMPLETED", label: "Mark Complete", color: "bg-[#2f765b] hover:bg-[#256b4f]" },
        ];
      default:
        return [];
    }
  };

  const actions = getAvailableActions(assignment.assignment.status);

  return (
    <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]" suppressHydrationWarning>
      <div className="mx-auto max-w-5xl">
        <Link
          href="/professional/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
        >
          <ArrowLeft data-icon="inline-start" /> Back to Dashboard
        </Link>

        <div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {assignment.assignment.status === "ASSIGNED" && (
                  <span className="rounded-full bg-[#f5b841] px-2 py-0.5 text-xs font-bold text-[#153443]">
                    NEW ASSIGNMENT
                  </span>
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(assignment.assignment.status)}`}>
                  {assignment.assignment.status.replaceAll('_', ' ')}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                {assignment.request.title}
              </h1>
              <p className="mt-3 text-[#60757b]">{assignment.request.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#60757b]">Assigned</p>
              <p className="font-bold">
                {new Date(assignment.assignment.assignedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e3ece7] bg-[#fbfcfa] p-6">
              <h2 className="font-bold text-[#153443]">Service Details</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="size-4 text-[#60757b]" />
                  <span className="text-[#60757b]">Location:</span>
                  <span className="font-semibold">{assignment.request.address}</span>
                </div>
                {assignment.assignment.scheduledDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="size-4 text-[#60757b]" />
                    <span className="text-[#60757b]">Scheduled:</span>
                    <span className="font-semibold">
                      {new Date(assignment.assignment.scheduledDate).toLocaleDateString()}
                      {assignment.assignment.scheduledTime && ` at ${assignment.assignment.scheduledTime}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <AlertCircle className="size-4 text-[#60757b]" />
                  <span className="text-[#60757b]">Urgency:</span>
                  <span className="font-semibold">{assignment.request.urgency}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="size-4 text-[#60757b]" />
                  <span className="text-[#60757b]">Priority:</span>
                  <span className="font-semibold">{assignment.assignment.priority}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3ece7] bg-[#fbfcfa] p-6">
              <h2 className="font-bold text-[#153443]">Assignment Notes</h2>
              {assignment.assignment.notes ? (
                <p className="mt-4 text-sm text-[#60757b]">{assignment.assignment.notes}</p>
              ) : (
                <p className="mt-4 text-sm text-[#60757b]">No additional notes provided.</p>
              )}
            </div>
          </div>

          {assignment.assignment.status === "ASSIGNED" && (
            <div className="mt-8 rounded-2xl border border-[#d98d2b] bg-[#fffdf5] p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 text-[#d98d2b]" />
                <div>
                  <h3 className="font-bold text-[#153443]">Action Required</h3>
                  <p className="mt-1 text-sm text-[#60757b]">
                    Please review this assignment and accept or decline it. Once accepted, you can start the work.
                  </p>
                </div>
              </div>
            </div>
          )}

          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => (
                <form key={action.action} action={updateAssignmentStatus}>
                  <input type="hidden" name="assignmentId" value={assignment.assignment.id} />
                  <input type="hidden" name="status" value={action.action} />
                  <button
                    type="submit"
                    className={`rounded-xl px-6 py-3 font-bold text-white transition ${action.color}`}
                  >
                    {action.label}
                  </button>
                </form>
              ))}
            </div>
          )}

          {assignment.assignment.status === "COMPLETED" && (
            <div className="mt-8 rounded-2xl border border-[#eaf5f0] bg-[#f0fdf4] p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 text-[#2f765b]" />
                <div>
                  <h3 className="font-bold text-[#153443]">Work Completed</h3>
                  <p className="mt-1 text-sm text-[#60757b]">
                    This assignment has been marked as completed. The customer will be notified to review the service.
                  </p>
                  {assignment.assignment.completedAt && (
                    <p className="mt-2 text-xs text-[#60757b]">
                      Completed on {new Date(assignment.assignment.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {assignment.assignment.status === "REJECTED" && (
            <div className="mt-8 rounded-2xl border border-[#fee2e2] bg-[#fef2f2] p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 text-[#dc2626]" />
                <div>
                  <h3 className="font-bold text-[#153443]">Assignment Declined</h3>
                  <p className="mt-1 text-sm text-[#60757b]">
                    This assignment has been declined. HunarLink staff will reassign it to another professional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-[#e3ece7] bg-white p-6">
          <h2 className="font-bold text-[#153443]">Need Help?</h2>
          <p className="mt-2 text-sm text-[#60757b]">
            Contact HunarLink support if you have questions about this assignment.
          </p>
          <Link
            href="/support"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#153443] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1a4152]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}
