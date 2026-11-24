'use client'

import { useState, useEffect, useTransition } from 'react'
import { X, Search, MapPin, Clock, AlertCircle, BriefcaseBusiness } from 'lucide-react'
import { Avatar } from '@/components/commen/avatar'
import { createDirectTask, getAllAssignableProfessionals, getServiceCategories } from '@/app/actions/task-management'

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

interface ServiceCategory {
  id: string
  name: string
  slug: string
  active: boolean
}

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [urgency, setUrgency] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [notes, setNotes] = useState('')
  const [budget, setBudget] = useState('')
  const [error, setError] = useState('')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && (professionals.length === 0 || categories.length === 0)) {
      startTransition(async () => {
        setLoading(true)
        const [profResult, catResult] = await Promise.all([
          getAllAssignableProfessionals(),
          getServiceCategories()
        ])
        if (profResult.ok) setProfessionals(profResult.professionals)
        if (catResult.ok) setCategories(catResult.categories)
        setLoading(false)
      })
    }
  }, [isOpen, professionals.length, categories.length])

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

  const handleCreateTask = () => {
    if (!selectedProfessional) {
      setError('Please select a professional')
      return
    }
    if (!selectedCategory) {
      setError('Please select a service category')
      return
    }
    if (!title || !description || !address) {
      setError('Please fill in all required fields')
      return
    }
    setError('')
    startTransition(async () => {
      const result = await createDirectTask({
        title,
        description,
        categoryId: selectedCategory,
        professionalId: selectedProfessional.profile?.id || selectedProfessional.workerProfile.id,
        address,
        urgency,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        priority,
        notes: notes || undefined,
        budget: budget ? parseInt(budget) : undefined,
      })

      if (result.ok) {
        onClose()
        onSuccess?.()
      } else {
        setError(result.message)
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-3xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e3ece7] p-6">
          <div>
            <h2 className="text-2xl font-bold">Create New Task</h2>
            <p className="mt-1 text-sm text-[#60757b]">
              Assign a new task directly to a verified professional
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Professional Selection */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-[#e3ece7]">
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
                    : 'No verified professional is currently available.'}
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
                              <BriefcaseBusiness className="size-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#60757b]">{professional.workerProfile.profession}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#60757b]">
                          <div className="flex items-center gap-1">
                            <Clock className="size-4" />
                            <span>{professional.workerProfile.experienceYears} years experience</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Task Form */}
          <div className="w-[450px] overflow-y-auto p-6 bg-[#f8faf9]">
            <h3 className="font-bold text-[#153443]">Task Details</h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#60757b]">Service Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#60757b]">Task Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#60757b]">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task requirements..."
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#60757b]">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#60757b]" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address"
                    className="mt-1 w-full rounded-xl border border-[#d5e2dc] pl-10 pr-4 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#60757b]">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')}
                    className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#60757b]">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')}
                    className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#60757b]">Budget (PKR)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-xl border border-[#d5e2dc] px-3 py-2 text-sm font-bold focus:border-[#2f765b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#60757b]">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add instructions for the professional..."
                  rows={3}
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
                onClick={handleCreateTask}
                disabled={pending}
                className="w-full rounded-xl bg-[#2f765b] px-4 py-3 font-bold text-white transition hover:bg-[#256b4f] disabled:opacity-50"
              >
                {pending ? 'Creating Task...' : 'Create & Assign Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
