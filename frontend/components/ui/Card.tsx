import { HTMLAttributes } from "react";

type Padding = "none" | "sm" | "md";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
}

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
};

export function Card({ className = "", padding = "md", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface ${paddingClasses[padding]} ${className}`}
      {...props}
    />
  );
}
