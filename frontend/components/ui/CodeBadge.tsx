import { HTMLAttributes } from "react";

interface CodeBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  code: string;
}

export function CodeBadge({ code, className = "", ...props }: CodeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-border-strong bg-surface-alt px-2.5 py-1 font-mono text-sm text-accent ${className}`}
      {...props}
    >
      {code}
    </span>
  );
}
