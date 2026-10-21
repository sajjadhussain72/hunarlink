import { FormEvent, ReactNode } from "react";
import { Button } from "./button";

interface FormProps {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Form({ 
  children, 
  onSubmit, 
  submitText = "Submit", 
  loading = false,
  disabled = false,
  className = "" 
}: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-4 ${className}`}>
      {children}
      <Button type="submit" loading={loading} disabled={disabled}>
        {submitText}
      </Button>
    </form>
  );
}
