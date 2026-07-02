import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, className = "", children, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={`w-full appearance-none rounded-lg border border-border bg-surface-alt px-3 py-2 pr-9 text-sm text-fg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent ${error ? "border-danger" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-fg-subtle"
          aria-hidden
        />
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});
