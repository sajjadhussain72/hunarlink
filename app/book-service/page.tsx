"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { createServiceRequest } from "@/app/actions/service-requests";
import { getCustomerLocations } from "@/app/actions/locations";
import { Dropdown } from "@/components/commen/dropdown";

type Location = Awaited<ReturnType<typeof getCustomerLocations>>[number];
const services = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  // "Mason",
  // "Welder",
  "Mechanic",
  "AC Technician",
  // "Refrigerator Technician",
  "Solar Technician",
  "CCTV Technician",
  "Internet / Network Technician",
  "Construction Worker",
  "Tile Worker",
  // "Glass Worker",
  "Cleaner",
  "Gardener",
  // "Driver",
  "Home Maintenance",
  "Loading / Shifting Worker",
  "Other Local Services",
];
const slug = (value: string) =>
  value.toLowerCase().replaceAll(" / ", "-").replaceAll(" ", "-");

export default function BookServicePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    urgency: "NORMAL" as "NORMAL" | "URGENT" | "EMERGENCY",
    address: "",
    preferredDate: "",
    preferredTime: "",
    locationId: "",
  });
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function checkAuth() {
    // If no locations are available, user is likely not authenticated
    if (locations.length === 0) {
      router.push("/sign-in?next=/book-service");
      return false;
    }
    return true;
  }

  useEffect(() => {
    getCustomerLocations().then(setLocations);
  }, []);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const next = (event: FormEvent) => {
    event.preventDefault();
    if (step === 1 && !service) return setMessage("Please choose a service.");
    if (step === 3 && !form.locationId)
      return setMessage("Please choose a service area.");
    setMessage("");
    setStep((current) => Math.min(current + 1, 4));
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!checkAuth()) return;
    setMessage("");
    const result = await createServiceRequest({
      categorySlug: slug(service),
      ...form,
    });
    if (!result.ok)
      setMessage(
        result.message ?? "We could not submit your request. Please try again.",
      );
    else setSubmitted(true);
  };
  if (submitted)
    return (
      <main className="min-h-screen bg-[#f7faf8] px-5 py-16 text-[#153443]">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#dfeae3] bg-white p-8 text-center shadow-sm md:p-12">
          <CheckCircle2 className="mx-auto size-14 text-[#2d8067]" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#d98d2b]">
            Request received
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.05em]">
            HunarLink is on it.
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-[#6d7e85]">
            We will review your request and contact you with the next update.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#153443] px-5 py-3 text-sm font-bold text-white"
          >
            View my services <ArrowRight />
          </Link>
        </div>
      </main>
    );
  const selectedLocation = locations.find(
    (location) => location.id === form.locationId,
  );
  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#153443]">
      <header className="border-b border-[#e1eae5] bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#f5b841]">
              <Wrench />
            </span>
            Hunar<span className="text-[#d98d2b]">Link</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-[#6d7e85]">
            Cancel
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d98d2b]">
            Book a HunarLink service
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.05em] md:text-5xl">
            Tell us what needs doing.
          </h1>
          <p className="mt-3 max-w-xl text-[#6d7e85]">
            We assign the right verified professional and manage the service
            from start to finish.
          </p>
          <div className="mt-8 grid grid-cols-4 gap-2">
            {["Service", "Details", "Location", "Review"].map(
              (label, index) => (
                <div
                  key={label}
                  className={`h-1.5 rounded-full ${index < step ? "bg-[#d98d2b]" : "bg-[#dfe9e3]"}`}
                  aria-label={`${label} ${index < step ? "complete" : "upcoming"}`}
                />
              ),
            )}
          </div>
        </div>
        <form
          onSubmit={step === 4 ? submit : next}
          className="rounded-3xl border border-[#dfeae3] bg-white p-6 shadow-sm md:p-10"
        >
          {step === 1 && (
            <fieldset>
              <legend className="text-2xl font-bold">
                What service do you need?
              </legend>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {services.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setService(item)}
                    className={`rounded-xl border p-4 text-left text-sm font-bold ${service === item ? "border-[#d98d2b] bg-[#fff8e9]" : "border-[#e1eae5]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {step === 2 && (
            <fieldset>
              <legend className="text-2xl font-bold">
                Tell us about the problem
              </legend>
              <div className="mt-7 grid gap-5">
                <input
                  required
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Short title, e.g. Kitchen water leakage"
                  className="rounded-xl border border-[#dfeae3] p-4"
                />
                <textarea
                  required
                  minLength={10}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe what you need help with"
                  className="min-h-36 rounded-xl border border-[#dfeae3] p-4"
                />
                <label className="grid gap-2 text-[14px] font-[500] ">
                  Urgency
                  <Dropdown
                    options={["Normal", "Urgent", "Emergency"]}
                    value={form.urgency}
                    onChange={(value) => update("urgency", value.toUpperCase())}
                  />
                </label>
              </div>
            </fieldset>
          )}
          {step === 3 && (
            <fieldset>
              <legend className="text-2xl font-bold">
                Where do you need the service?
              </legend>
              <div className="mt-7 grid gap-5">
                <label className="grid gap-2 text-sm font-bold">
                  Service area
                  <Dropdown
                    options={locations.map(loc => ({ label: `${loc.name} — ${loc.region}`, value: loc.id }))}
                    value={form.locationId}
                    onChange={(value) => update("locationId", value)}
                    placeholder="Select an active area"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Complete address
                  <textarea
                    required
                    minLength={5}
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="House, street, landmark, area"
                    className="min-h-28 rounded-xl border border-[#dfeae3] p-4 font-normal"
                  />
                </label>
              </div>
            </fieldset>
          )}
          {step === 4 && (
            <fieldset>
              <legend className="text-2xl font-bold">
                Review your request
              </legend>
              <div className="mt-7 space-y-4 rounded-2xl bg-[#f5f8f6] p-5 text-sm">
                <p>
                  <strong>Service:</strong> {service}
                </p>
                <p>
                  <strong>Area:</strong> {selectedLocation?.name},{" "}
                  {selectedLocation?.region}
                </p>
                <p>
                  <strong>Address:</strong> {form.address}
                </p>
                <p>
                  <strong>Request:</strong> {form.title}
                </p>
                <p>
                  <strong>Urgency:</strong> {form.urgency}
                </p>
              </div>
            </fieldset>
          )}
          {message && (
            <p className="mt-5 rounded-xl bg-[#fff2f0] p-3 text-sm font-bold text-[#a44737]">
              {message}
            </p>
          )}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
              >
                <ChevronLeft className="size-4" />
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#153443] px-5 py-3 text-sm font-bold text-white">
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#d98d2b] px-5 py-3 text-sm font-bold text-white">
                Send Request to HunarLink <ShieldCheck className="size-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
