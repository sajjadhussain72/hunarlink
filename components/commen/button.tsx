import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ 
  variant = "primary", 
  size = "md", 
  loading = false,
  className = "", 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-[#153443] text-white hover:bg-[#1a3d4f]",
    secondary: "bg-[#f5b841] text-[#153443] hover:bg-[#e6a83a]",
    outline: "border border-[#dfeae3] bg-white text-[#153443] hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  
  const sizeStyles = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-5 py-3 text-sm rounded-xl",
    lg: "px-6 py-4 text-base rounded-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </button>
  );
}
