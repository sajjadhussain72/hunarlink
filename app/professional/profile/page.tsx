"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/professional/profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to submit profile. Please try again.");
        return;
      }

      setMessage("Your professional profile has been submitted for review. We will verify your information and approve your account.");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 text-[#153443]" suppressHydrationWarning>
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
        >
          <ArrowLeft data-icon="inline-start" /> Back to HunarLink
        </Link>
        <div className="mt-8 rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm md:p-12">
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#f5b841]">
            <Wrench />
          </div>
          <p className="mt-7 text-sm font-bold uppercase tracking-[.18em] text-[#c47b13]">
            Complete your profile
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.04em]">
            Professional details
          </h1>
          <p className="mt-4 leading-7 text-[#60757b]">
            Tell us about your skills and experience. Your profile will be reviewed
            by our team before you can receive service assignments.
          </p>
          <form action={submit} className="mt-8 flex flex-col gap-4">
            <div>
              <label htmlFor="profession" className="mb-2 block text-sm font-bold">
                Profession *
              </label>
              <select
                id="profession"
                name="profession"
                required
                className="w-full rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]"
              >
                <option value="">Select your profession</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Painter">Painter</option>
                <option value="Mason">Mason</option>
                <option value="Welder">Welder</option>
                <option value="Mechanic">Mechanic</option>
                <option value="AC Technician">AC Technician</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="mb-2 block text-sm font-bold">
                Bio / Description *
              </label>
              <textarea
                id="bio"
                name="bio"
                required
                rows={4}
                placeholder="Describe your skills, experience, and the services you offer..."
                className="w-full rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13] resize-none"
              />
            </div>

            <div>
              <label htmlFor="experienceYears" className="mb-2 block text-sm font-bold">
                Years of Experience *
              </label>
              <input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min="0"
                max="50"
                required
                placeholder="e.g., 5"
                className="w-full rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]"
              />
            </div>

            <div>
              <label htmlFor="hourlyRate" className="mb-2 block text-sm font-bold">
                Hourly Rate (PKR) - Optional
              </label>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0"
                placeholder="e.g., 500"
                className="w-full rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]"
              />
            </div>

            <div>
              <label htmlFor="minimumCharge" className="mb-2 block text-sm font-bold">
                Minimum Charge (PKR) - Optional
              </label>
              <input
                id="minimumCharge"
                name="minimumCharge"
                type="number"
                min="0"
                placeholder="e.g., 1000"
                className="w-full rounded-xl border border-[#d9e5df] px-4 py-3 outline-none focus:border-[#c47b13]"
              />
            </div>

            <button
              disabled={pending}
              className="rounded-xl bg-[#153443] px-5 py-3 font-bold text-white disabled:opacity-60"
            >
              {pending ? "Submitting..." : "Submit for verification"}
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              <AlertCircle className="mr-2 inline" />
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">
              <CheckCircle2 className="mr-2 inline" />
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
