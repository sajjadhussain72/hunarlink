'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { BriefcaseBusiness, Filter, Search, Calendar, MapPin, User, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import { Avatar } from '@/components/commen/avatar'
import { getAllAssignableProfessionals, syncProfessionalProfiles } from '@/app/actions/task-management'

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
    createdAt?: string | Date
  }
  workerProfile: {
    id: string
    profession: string
    experienceYears: number
    verificationStatus: string
    availabilityStatus: string
  }
}

export default function AdminAllProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [, startTransition] = useTransition()

  const loadProfessionals = () => {
    startTransition(async () => {
      const result = await getAllAssignableProfessionals()
      if (result.ok) {
        setProfessionals(result.professionals)
      } else {
        setError(result.message)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadProfessionals()
  }, [])

  const filteredProfessionals = useMemo(() => {
    let filtered = professionals
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.workerProfile.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.user.email && p.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.user.phone && p.user.phone.includes(searchQuery))
      )
    }
    if (statusFilter) {
      filtered = filtered.filter((p) => p.workerProfile.availabilityStatus === statusFilter)
    }
    // Map to ensure profile is not null
    return filtered.map(p => ({
      ...p,
      profile: p.profile || {
        id: p.workerProfile.id,
        userId: p.user.id,
        profession: p.workerProfile.profession,
        status: 'APPROVED',
        verificationStatus: p.workerProfile.verificationStatus
      }
    }))
  }, [searchQuery, statusFilter, professionals])

  const handleSync = () => {
    setSyncing(true)
    setError('')
    setSuccess('')
    startTransition(async () => {
      const result = await syncProfessionalProfiles()
      if (result.ok) {
        setSuccess(result.message)
        loadProfessionals()
      } else {
        setError(result.message)
      }
      setSyncing(false)
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-[#eaf5f0] text-[#2f765b]'
      case 'OFFLINE':
        return 'bg-[#f5f5f5] text-[#60757b]'
      default:
        return 'bg-[#f5f5f5] text-[#60757b]'
    }
  }

  return (
    <div suppressHydrationWarning>
      <div>
        <p className="text-sm font-bold text-[#c47b13]">Professional management</p>
        <h2 className="mt-2 text-4xl font-black">All Professionals</h2>
        <p className="mt-3 max-w-2xl text-[#60757b]">
          View all verified professionals, their availability, and current assignments.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle className="mr-2 inline" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
          <CheckCircle2 className="mr-2 inline" />
          {success}
        </div>
      )}

      {/* Sync Button */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#e3ece7] bg-white p-4">
        <div className="flex items-center gap-3">
          <RefreshCw className="size-5 text-[#c47b13]" />
          <div>
            <p className="text-sm font-bold text-[#153443]">Sync Professional Profiles</p>
            <p className="text-xs text-[#60757b]">
              Migrate verified workers to professional profile table
            </p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-xl bg-[#2f765b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#256b4f] disabled:opacity-60"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border border-[#e3ece7] bg-white p-4">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#d9e5df] bg-[#fbfcfa] px-4 py-2">
          <Search className="size-4 text-[#60757b]" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#60757b]/50"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#d9e5df] bg-[#fbfcfa] px-4 py-2">
          <Filter className="size-4 text-[#60757b]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm outline-none"
          >
            <option value="">All Status</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="BUSY">Busy</option>
          </select>
        </div>
      </div>

      {/* Professionals List */}
      {loading ? (
        <div className="mt-6 text-center text-sm text-[#60757b]">
          Loading professionals...
        </div>
      ) : filteredProfessionals.length === 0 ? (
        <div className="mt-6 text-center text-sm text-[#60757b]">
          {professionals.length === 0
            ? 'No verified professionals found.'
            : 'No professionals match your filters.'}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredProfessionals.map((professional) => (
            <article
              key={professional.profile?.id || professional.workerProfile.id}
              className="rounded-2xl border border-[#e3ece7] bg-[#fbfcfa] p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={professional.user.name}
                    image={professional.user.image}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#153443]">{professional.user.name}</h3>
                      {professional.profile?.verificationStatus === 'VERIFIED' && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-[#2f765b]">
                          <CheckCircle2 className="size-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#60757b]">{professional.workerProfile.profession}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#60757b]">
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>{professional.workerProfile.experienceYears} years experience</span>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(professional.workerProfile.availabilityStatus)}`}>
                        {professional.workerProfile.availabilityStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/admin/tasks?professionalId=${professional.profile?.id || professional.workerProfile.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f765b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#256b4f]"
                  >
                    <BriefcaseBusiness className="size-4" />
                    View Assignments
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 border-t border-[#edf1ee] pt-4 text-sm text-[#60757b]">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{professional.user.email}</span>
                </div>
                {professional.user.phone && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{professional.user.phone}</span>
                  </div>
                )}
                {professional.user.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Joined {new Date(professional.user.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
