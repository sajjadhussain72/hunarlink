import { useState } from "react";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: string[] | DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function Dropdown({ options, value, onChange, className = "", placeholder = "Select an option" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isObjectOptions = options.length > 0 && typeof options[0] === 'object';
  const selectedLabel = isObjectOptions
    ? (options as DropdownOption[]).find(opt => opt.value === value)?.label || placeholder
    : value || placeholder;

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border p-3 text-left pr-3"
      >
        {selectedLabel}
        <svg
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full rounded-xl border bg-white p-1 shadow-lg">
          {isObjectOptions ? (
            (options as DropdownOption[]).map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left hover:bg-gray-100"
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
            (options as string[]).map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left hover:bg-gray-100"
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
