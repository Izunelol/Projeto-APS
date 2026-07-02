interface ProgressBarProps {
  percent: number;
  color?: "accent" | "neutral";
}

export function ProgressBar({ percent, color = "accent" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
      <div
        className={`h-full rounded-full ${color === "accent" ? "bg-accent" : "bg-fg-subtle"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
