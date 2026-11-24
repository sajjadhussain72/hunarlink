'use client'

import { useState, useEffect, useTransition } from 'react'
import { X, Search, MapPin, CheckCircle2, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { Avatar } from '@/components/commen/avatar'
import { assignProfessional, getAssignableProfessionalsForService, reassignProfessional } from '@/app/actions/service-assignments'

interface Professional {
  profile: {
    id: string
    userId: string
    profession: string
    status: string
    verificationStatus: string
  } | null
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    status: string
  }
  workerProfile: {
    id: string
    profession: string
    experienceYears: number
    verificationStatus: string
    availabilityStatus: string
  }
}

interface ServiceRequest {
  id: string
  title: string
  description: string
  address: string
  urgency: string
  preferredDate: Date | null
  preferredTime: string | null
}

interface AssignProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  serviceRequest: ServiceRequest
  categoryName: string
  customerName: string
  onSuccess?: () => void
  isReassign?: boolean
  currentAssignmentId?: string
}

export function AssignProfessionalModal({
  isOpen,
  onClose,
  serviceRequest,
  categoryName,
  customerName,
  onSuccess,
  isReassign = false,
  currentAssignmentId,
}: AssignProfessionalModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('NORMAL')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()

  // Load professionals when modal opens
  useEffect(() => {
    if (isOpen && professionals.length === 0) {
      startTransition(async () => {
        setLoading(true)
        const result = await getAssignableProfessionalsForService(serviceRequest.id)
        if (result.ok) {
          setProfessionals(result.professionals)
        } else {
          setError(result.message)
        }
        setLoading(false)
      })
    }
  }, [isOpen, serviceRequest.id, professionals.length])

  const filteredProfessionals = professionals
    .filter((p) =>
      p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.workerProfile.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user.email && p.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.user.phone && p.user.phone.includes(searchQuery))
    )
    .map(p => ({
      ...p,
      // Use workerProfile data if professionalProfile is null
      profile: p.profile || {
        id: p.workerProfile.id,
        userId: p.user.id,
        profession: p.workerProfile.profession,
        status: 'APPROVED',
        verificationStatus: p.workerProfile.verificationStatus
      }
    }))

  const handleAssign = () => {
    if (!selectedProfessional) {
      setError('Please select a professional')
      return
    }
    setShowConfirmation(true)
  }

  const handleConfirmAssignment = () => {
    if (!selectedProfessional) {
      setError('Please select a professional')
      return
    }
    setError('')
    startTransition(async () => {
      let result

      if (isReassign && currentAssignmentId) {
        result = await reassignProfessional({
          assignmentId: currentAssignmentId,
          newProfessionalId: selectedProfessional.profile?.id || selectedProfessional.workerProfile.id,
          notes: notes || undefined,
        })
      } else {
        result = await assignProfessional({
          serviceRequestId: serviceRequest.id,
          professionalId: selectedProfessional.profile?.id || selectedProfessional.workerProfile.id,
          scheduledDate: scheduledDate || undefined,
          scheduledTime: scheduledTime || undefined,
          notes: notes || undefined,
          priority: priority as any,
        })
      }

      if (result.ok) {
        setShowConfirmation(false)
        onClose()
        onSuccess?.()
      } else {
        setError(result.message)
        setShowConfirmation(false)
      }
    })
  }

  if (!isOpen) return null

  if (showConfirmation && selectedProfessional) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isReassign ? 'Confirm Reassignment' : 'Confirm Assignment'}
            </h2>
            <button
              onClick={() => setShowConfirmation(false)}
              className="rounded-lg p-2 transition hover:bg-gray-100"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#60757b]">Customer</p>
              <p className="font-bold">{customerName}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#60757b]">Service</p>
              <p className="font-bold">{serviceRequest.title}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#60757b]">Professional</p>
              <div className="mt-2 flex items-center gap-3">
                <Avatar name={selectedProfessional.user.name} image={selectedProfessional.user.image} size="sm" />
                <div>
                  <p className="font-bold">{selectedProfessional.user.name}</p>
                  <p className="text-sm text-[#60757b]">{selectedProfessional.workerProfile.profession}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#60757b]">Location</p>
              <p className="font-bold">{serviceRequest.address}</p>
            </div>

            {scheduledDate && (
              <div>
                <p className="text-sm font-semibold text-[#60757b]">Schedule</p>
                <p className="font-bold">
                  {new Date(scheduledDate).toLocaleDateString()} {scheduledTime && `at ${scheduledTime}`}
                </p>
              </div>
            )}

            {notes && (
              <div>
                <p className="text-sm font-semibold text-[#60757b]">Assignment Notes</p>
                <p className="text-sm">{notes}</p>
              </div>
            )}

            {isReassign && (
              <div className="flex items-start gap-2 rounded-lg bg-[#fff5df] p-3 text-sm text-[#9a6410]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>The previous assignment will be cancelled and preserved in history.</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={pending}
              className="flex-1 rounded-xl border border-[#d5e2dc] px-4 py-3 font-bold text-[#153443] transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAssignment}
              disabled={pending}
              className="flex-1 rounded-xl bg-[#2f765b] px-4 py-3 font-bold text-white transition hover:bg-[#256b4f] disabled:opacity-50"
            >
              {pending ? 'Processing...' : isReassign ? 'Confirm Reassignment' : 'Confirm Assignment'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3ece7] p-6">
          <div>
            <h2 className="text-2xl font-bold">
              {isReassign ? (
                <>
                  <RefreshCw className="inline mr-2 size-6" />
                  Reassign Professional
                </>
              ) : (
                'Assign Professional'
              )}
            </h2>
            <p className="mt-1 text-sm text-[#60757b]">
              {isReassign
                ? 'Select a new approved professional for this service request'
                : 'Select an approved professional for this service request'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Service Request Summary */}
        <div className="border-b border-[#e3ece7] bg-[#f8faf9] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[#60757b]">Service</p>
              <p className="font-bold">{categoryName}</p>
              <p className="mt-1 text-sm font-bold text-[#153443]">{serviceRequest.title}</p>
              <p className="mt-1 text-sm text-[#60757b]">{serviceRequest.description}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#60757b]">Customer</p>
              <p className="font-bold">{customerName}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-[#60757b]">
                <MapPin className="size-4" />
                <span>{serviceRequest.address}</span>
              </div>
              {serviceRequest.preferredDate && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#60757b]">
                  <Calendar className="size-4" />
                  <span>
                    {new Date(serviceRequest.preferredDate).toLocaleDateString()}
                    {serviceRequest.preferredTime && ` at ${serviceRequest.preferredTime}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Professional List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#60757b]" />
                <input
                  type="text"
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#d5e2dc] pl-10 pr-4 py-2.5 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-[#60757b]">
                Loading professionals...
              </div>
            ) : filteredProfessionals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="size-12 text-[#c47b13]" />
                <p className="mt-4 font-bold text-[#153443]">No professionals available</p>
                <p className="mt-2 text-sm text-[#60757b]">
                  {searchQuery
                    ? 'No professionals match your search.'
                    : 'No verified professional is currently available for this service.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProfessionals.map((professional) => (
                  <button
                    key={professional.profile?.id || professional.workerProfile.id}
                    onClick={() => setSelectedProfessional(professional)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:border-[#2f765b] ${
                      (selectedProfessional?.profile?.id || selectedProfessional?.workerProfile.id) === (professional.profile?.id || professional.workerProfile.id)
                        ? 'border-[#2f765b] bg-[#eaf5f0]'
                        : 'border-[#e3ece7] bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar
                        name={professional.user.name}
                        image={professional.user.image}
                        size="lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#153443]">{professional.user.name}</h3>
                          {professional.workerProfile.verificationStatus === 'VERIFIED' && (
                            <div className="flex size-5 items-center justify-center rounded-full bg-[#2f765b]">
                              <CheckCircle2 className="size-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#60757b]">{professional.workerProfile.profession}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#60757b]">
                          <div className="flex items-center gap-1">
                            <MapPin className="size-4" />
                            <span>Available</span>
                          </div>
                          {professional.workerProfile.experienceYears > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <span>{professional.workerProfile.experienceYears} years experience</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignment Details Sidebar */}
          <div className="w-80 border-l border-[#e3ece7] bg-[#f8faf9] p-6">
            <h3 className="font-bold text-[#153443]">
              {isReassign ? 'Reassignment Details' : 'Assignment Details'}
            </h3>

            {selectedProfessional ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-white p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={selectedProfessional.user.name}
                      image={selectedProfessional.user.image}
                      size="sm"
                    />
                    <div>
                      <p className="font-bold text-sm">{selectedProfessional.user.name}</p>
                      <p className="text-xs text-[#60757b]">{selectedProfessional.workerProfile.profession}</p>
                    </div>
                  </div>
                </div>

                {!isReassign && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#60757b]">Scheduled Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#60757b]">Scheduled Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#60757b]">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                      >
                        <option value="LOW">Low</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#60757b]">
                    {isReassign ? 'Reassignment Notes' : 'Assignment Notes'}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isReassign ? 'Add reason for reassignment...' : 'Add instructions for the professional...'}
                    rows={4}
                    className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAssign}
                  disabled={pending}
                  className="w-full rounded-xl bg-[#2f765b] px-4 py-3 font-bold text-white transition hover:bg-[#256b4f] disabled:opacity-50"
                >
                  {pending ? 'Processing...' : isReassign ? 'Reassign Work' : 'Assign Work'}
                </button>
              </div>
            ) : (
              <div className="mt-4 text-center text-sm text-[#60757b]">
                Select a professional from the list to view assignment details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
