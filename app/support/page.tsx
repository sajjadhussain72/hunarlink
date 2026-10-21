import Link from "next/link";
import { ArrowLeft, Headphones, MessageCircle, Phone } from "lucide-react";
import { SupportChat } from "@/components/support-chat";
import { publicConfig } from "@/lib/public-config";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#fbfcfa] text-[#153443]">
      <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-[#60757b]"
        >
          <ArrowLeft data-icon="inline-start" /> Back to HunarLink
        </Link>
        <div className="rounded-3xl border border-[#e3ece7] bg-white p-8 shadow-sm md:p-12">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#fff4d8] text-[#c47b13]">
            <Headphones />
          </div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[.18em] text-[#c47b13]">
            HunarLink support
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-.04em]">
            We manage the details, you get it done.
          </h1>
          <p className="mt-4 max-w-xl leading-7 text-[#60757b]">
            Need help with a service request, appointment, invoice, or
            complaint? Contact the HunarLink team and we will take care of it.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={
                publicConfig.phone ? `tel:${publicConfig.phone}` : undefined
              }
              className="rounded-2xl border border-[#e3ece7] p-5 transition hover:border-[#f5b841]"
            >
              <Phone className="text-[#c47b13]" />
              <h2 className="mt-4 font-bold">Call HunarLink</h2>
              <p className="mt-1 text-sm text-[#60757b]">
                Speak with our service team.
              </p>
            </a>
            <a
              href={
                publicConfig.phone
                  ? `https://wa.me/${publicConfig.phone.replace(/\D/g, "")}`
                  : undefined
              }
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#e3ece7] p-5 transition hover:border-[#f5b841]"
            >
              <MessageCircle className="text-[#c47b13]" />
              <h2 className="mt-4 font-bold">WhatsApp HunarLink</h2>
              <p className="mt-1 text-sm text-[#60757b]">
                Send a message about your request.
              </p>
            </a>
          </div>
          <SupportChat />
          <Link
            href="/book-service"
            className="mt-8 inline-flex rounded-xl bg-[#153443] px-5 py-3 font-bold text-white"
          >
            Book a service
          </Link>
        </div>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Support | HunarLink",
  description: "Contact the HunarLink service team.",
};
