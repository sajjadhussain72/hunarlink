import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold">
      {label && <span>{label}</span>}
      <textarea
        className={`rounded-xl border border-[#dfeae3] p-3 font-normal focus:border-[#d98d2b] focus:outline-none ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </label>
  );
}
