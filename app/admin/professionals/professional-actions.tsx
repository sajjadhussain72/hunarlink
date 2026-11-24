"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { approveProfessional } from "@/app/actions/professionals";

interface ProfessionalActionsProps {
  profileId: string;
}

export function ProfessionalActions({ profileId }: ProfessionalActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveProfessional({ profileId, action: "APPROVE" });
      if (result.ok) {
        window.location.reload();
      } else {
        alert(result.message);
      }
    });
  }

  function handleReject() {
    const reason = prompt("Rejection reason (optional):");
    if (reason !== null) {
      startTransition(async () => {
        const result = await approveProfessional({
          profileId,
          action: "REJECT",
          rejectionReason: reason,
        });
        if (result.ok) {
          window.location.reload();
        } else {
          alert(result.message);
        }
      });
    }
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <button
        onClick={handleApprove}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-xl bg-[#2f765b] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
      >
        <CheckCircle2 className="size-4" />
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={pending}
        className="flex items-center justify-center gap-2 rounded-xl border border-[#c84b4b] px-4 py-2 text-sm font-bold text-[#c84b4b] disabled:opacity-50"
      >
        <XCircle className="size-4" />
        Reject
      </button>
    </div>
  );
}
