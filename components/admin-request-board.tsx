'use client'

import { useEffect, useState, useTransition } from 'react'
import { UserCheck, Mail, RefreshCw } from 'lucide-react'
import { getAdminRequests, updateRequestStatus, type AdminRequestRows } from '@/app/actions/admin-operations'
import { AssignProfessionalModal } from '@/components/assign-professional-modal'
import { getAssignmentHistory, getAssignmentByServiceRequestId } from '@/app/actions/service-assignments'

type Row = Extract<AdminRequestRows, { ok: true }>['rows'][number]
const statuses = ['REQUESTED','UNDER_REVIEW','ASSIGNING','ASSIGNED','CONFIRMED','PROFESSIONAL_ON_THE_WAY','SERVICE_STARTED','SERVICE_COMPLETED','CUSTOMER_CONFIRMED','CLOSED','CANCELLED','RESCHEDULED','DISPUTED','REQUIRES_FOLLOW_UP']

export function AdminRequestBoard() {
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const [selectedRequest, setSelectedRequest] = useState<Row | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([])
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null)

  function load() {
    startTransition(async () => {
      const result = await getAdminRequests()
      if (result.ok) {
        setRows(result.rows)
        setError('')
      } else {
        setError(result.message)
      }
    })
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 5000)
    return () => window.clearInterval(timer)
  }, [])

  function change(requestId: string, status: string) {
    startTransition(async () => {
      const result = await updateRequestStatus({ requestId, status })
      if (!result.ok) {
        setError(result.message)
      } else {
        load()
      }
    })
  }

  function handleAssignProfessional(row: Row) {
    setSelectedRequest(row)
    setShowAssignModal(true)
  }

  function handleReassignProfessional(row: Row) {
    setSelectedRequest(row)
    startTransition(async () => {
      const result = await getAssignmentByServiceRequestId(row.request.id)
      setCurrentAssignmentId(result.ok && result.assignment ? result.assignment.id : null)
      setShowReassignModal(true)
    })
  }

  function handleCloseModal() {
    setShowAssignModal(false)
    setShowReassignModal(false)
    setSelectedRequest(null)
    setCurrentAssignmentId(null)
  }

  function handleAssignmentSuccess() {
    load()
    handleCloseModal()
  }

  function handleViewHistory(requestId: string) {
    startTransition(async () => {
      const result = await getAssignmentHistory(requestId)
      if (result.ok) {
        setAssignmentHistory(result.history)
        setShowHistory(requestId)
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-3xl border border-[#e3ece7] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#e3ece7] p-5">
          <div>
            <h2 className="font-bold">Incoming service requests</h2>
            <p className="text-sm text-[#60757b]">Review every booking, contact the customer, and move it through delivery.</p>
          </div>
          <button onClick={load} disabled={pending} className="rounded-xl border px-3 py-2 text-xs font-bold">
            Refresh
          </button>
        </div>
        <div className="divide-y divide-[#e3ece7]">
          {rows.length === 0 && !error && (
            <p className="p-8 text-sm text-[#60757b]">No bookings received yet. Customer bookings will appear here automatically.</p>
          )}
          {rows.map(({ request, category, customerName, customerEmail }) => (
            <article key={request.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#eaf5f0] px-3 py-1 text-xs font-bold text-[#2f765b]">
                      {category.name}
                    </span>
                    <span className="rounded-full bg-[#fff5df] px-3 py-1 text-xs font-bold text-[#9a6410]">
                      {request.urgency}
                    </span>
                    <span className="rounded-full bg-[#f0f0f0] px-3 py-1 text-xs font-bold text-[#60757b]">
                      {request.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{request.title}</h3>
                  <p className="mt-1 text-sm text-[#60757b]">{request.description}</p>
                  <p className="mt-3 text-sm">
                    <strong>{customerName}</strong> · {customerEmail}
                  </p>
                  <p className="text-sm text-[#60757b]">
                    {request.address} · {request.preferredTime || 'Flexible time'}
                  </p>
                </div>
                <div className="flex min-w-[220px] flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#60757b]" htmlFor={`status-${request.id}`}>
                    Service status
                  </label>
                  <select
                    id={`status-${request.id}`}
                    value={request.status}
                    onChange={(event) => change(request.id, event.target.value)}
                    disabled={pending}
                    className="rounded-xl border border-[#d5e2dc] bg-white px-3 py-2 text-sm font-bold"
                  >
                    <option value={request.status}>{request.status.replaceAll('_', ' ')}</option>
                    {statuses.filter((status) => status !== request.status).map((status) => (
                      <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <a className="flex items-center gap-1 text-sm font-bold text-[#2f765b]" href={`mailto:${customerEmail}`}>
                      <Mail className="size-4" />
                      Email
                    </a>
                    {request.status === 'REQUESTED' || request.status === 'UNDER_REVIEW' ? (
                      <button
                        onClick={() => handleAssignProfessional({ request, category, customerName, customerEmail })}
                        className="flex items-center gap-1 rounded-lg bg-[#2f765b] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#256b4f]"
                      >
                        <UserCheck className="size-4" />
                        Assign
                      </button>
                    ) : request.status === 'ASSIGNED' || request.status === 'CONFIRMED' || request.status === 'SERVICE_STARTED' ? (
                      <button
                        onClick={() => handleReassignProfessional({ request, category, customerName, customerEmail })}
                        className="flex items-center gap-1 rounded-lg border border-[#d98d2b] bg-[#fff5df] px-3 py-2 text-sm font-bold text-[#9a6410] transition hover:bg-[#ffe8a0]"
                      >
                        <RefreshCw className="size-4" />
                        Reassign
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleViewHistory(request.id)}
                      className="text-sm font-bold text-[#60757b] hover:text-[#2f765b]"
                    >
                      History
                    </button>
                  </div>
                </div>
              </div>
              {showHistory === request.id && (
                <div className="mt-4 rounded-xl border border-[#e3ece7] bg-[#f8faf9] p-4">
                  <h4 className="font-bold text-sm">Assignment History</h4>
                  {assignmentHistory.length === 0 ? (
                    <p className="mt-2 text-sm text-[#60757b]">No history available.</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {assignmentHistory.map((h) => (
                        <div key={h.history.id} className="flex items-start gap-2 text-sm">
                          <span className="text-xs text-[#60757b]">
                            {new Date(h.history.createdAt).toLocaleString()}
                          </span>
                          <span className="text-[#60757b]">
                            {h.history.previousStatus ? `Changed from ${h.history.previousStatus} ` : ''}
                            to {h.history.newStatus}
                            {h.adminName && ` by ${h.adminName}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setShowHistory(null)}
                    className="mt-3 text-xs font-bold text-[#60757b] hover:text-[#2f765b]"
                  >
                    Close
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
        {error && (
          <p className="border-t border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>
        )}
      </section>

      {selectedRequest && (
        <AssignProfessionalModal
          isOpen={showAssignModal || showReassignModal}
          onClose={handleCloseModal}
          serviceRequest={selectedRequest.request}
          categoryName={selectedRequest.category.name}
          customerName={selectedRequest.customerName}
          onSuccess={handleAssignmentSuccess}
          isReassign={showReassignModal}
          currentAssignmentId={currentAssignmentId || undefined}
        />
      )}
    </>
  )
}
