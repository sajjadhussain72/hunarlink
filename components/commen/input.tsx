import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold">
      {label && <span>{label}</span>}
      <input
        className={`rounded-xl border border-[#dfeae3] p-3 font-normal focus:border-[#d98d2b] focus:outline-none ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </label>
  );
}
