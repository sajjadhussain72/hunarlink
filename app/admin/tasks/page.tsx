'use client'

import Link from "next/link";
import { useState, useEffect, useTransition, use } from "react";
import { BriefcaseBusiness, Filter, Calendar, MapPin, User, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { getAllAssignments, getAssignmentStats } from "@/app/actions/task-management";
import { Avatar } from "@/components/commen/avatar";
import { CreateTaskModal } from "@/components/create-task-modal";

function CreateTaskModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f765b] px-5 py-3 font-bold text-white transition hover:bg-[#256b4f]"
      >
        <Plus className="size-5" />
        Create Task
      </button>
      <CreateTaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}

export default function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; professionalId?: string; categoryId?: string; search?: string }>;
}) {
  const resolvedSearchParams = use(searchParams);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, assigned: 0, inProgress: 0, completed: 0 });
  const [error, setError] = useState('');
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [assignmentsResult, statsResult] = await Promise.all([
        getAllAssignments(resolvedSearchParams),
        getAssignmentStats()
      ]);
      if (assignmentsResult.ok) setAssignments(assignmentsResult.assignments);
      else setError(assignmentsResult.message);
      if (statsResult.ok) setStats(statsResult.stats);
    });
  }, [resolvedSearchParams]);

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

  return (
    <div suppressHydrationWarning>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[#c47b13]">Task management</p>
          <h2 className="mt-2 text-4xl font-black">Assignments</h2>
          <p className="mt-3 max-w-2xl text-[#60757b]">
            View and manage all professional assignments across service requests.
          </p>
        </div>
        <CreateTaskModalTrigger />
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle className="mr-2 inline" />
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
          <BriefcaseBusiness className="text-[#c47b13]" />
          <p className="mt-4 text-3xl font-bold">{stats.total}</p>
          <h2 className="mt-1 font-bold">Total Assignments</h2>
        </div>
        <div className="rounded-2xl border border-[#e3ece7] bg-white p-6">
          <Clock className="text-[#c47b13]" />
          <p className="mt-4 text-3xl font-bold">{stats.assigned}</p>
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

      {/* Filters */}
      <div className="mt-8 rounded-2xl border border-[#e3ece7] bg-white p-6">
        <div className="flex items-center gap-2">
          <Filter className="text-[#c47b13]" />
          <h3 className="font-bold">Filters</h3>
        </div>
        <form className="mt-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-[#60757b] mb-1">Search</label>
            <input
              type="text"
              name="search"
              defaultValue={resolvedSearchParams.search}
              placeholder="Search by title, professional, or address..."
              className="w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
            />
          </div>
          <div className="min-w-[150px]">
            <label className="block text-sm font-semibold text-[#60757b] mb-1">Status</label>
            <select
              name="status"
              defaultValue={resolvedSearchParams.status}
              className="w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-6 rounded-xl bg-[#2f765b] px-6 py-2 font-bold text-white transition hover:bg-[#256b4f]"
          >
            Apply Filters
          </button>
          <Link
            href="/admin/tasks"
            className="mt-6 rounded-xl border border-[#d5e2dc] px-6 py-2 font-bold text-[#153443] transition hover:bg-gray-50"
          >
            Clear
          </Link>
        </form>
      </div>

      {/* Assignments List */}
      <div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold">Assignments</h2>
        {assignments.length === 0 ? (
          <div className="mt-6 text-center text-sm text-[#60757b]">
            No assignments found. Adjust filters or check back later.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {assignments.map(({ assignment, request, category, customer, professional }) => (
              <article
                key={assignment.id}
                className="rounded-2xl border border-[#e3ece7] bg-[#fbfcfa] p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status.replaceAll('_', ' ')}
                      </span>
                      {request.urgency !== 'NORMAL' && (
                        <span className="rounded-full bg-[#fff4df] px-3 py-1 text-xs font-bold text-[#9a6414]">
                          {request.urgency}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-[#153443]">{request.title}</h3>
                    <p className="mt-1 text-sm text-[#60757b]">{request.description}</p>
                    <p className="mt-2 text-sm font-semibold text-[#c47b13]">{category.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#60757b]">Assigned</p>
                    <p className="font-bold">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#e3ece7] bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#60757b]">
                      <User className="size-4" />
                      Customer
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar
                        name={customer.name}
                        image={customer.image}
                        size="sm"
                      />
                      <div>
                        <p className="font-bold text-[#153443]">{customer.name}</p>
                        <p className="text-xs text-[#60757b]">{customer.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e3ece7] bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#60757b]">
                      <BriefcaseBusiness className="size-4" />
                      Professional
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar
                        name={professional.name}
                        image={professional.image}
                        size="sm"
                      />
                      <div>
                        <p className="font-bold text-[#153443]">{professional.name}</p>
                        <p className="text-xs text-[#60757b]">{professional.profession}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 border-t border-[#edf1ee] pt-4 text-sm text-[#60757b]">
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
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" />
                    <span>Priority: {assignment.priority}</span>
                  </div>
                </div>

                {assignment.notes && (
                  <div className="mt-4 rounded-xl bg-[#f8faf9] p-3 text-sm text-[#60757b]">
                    <strong>Admin Notes:</strong> {assignment.notes}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
