import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  progressPercent?: number;
  accent?: "success" | "neutral";
}

export function StatTile({ label, value, sublabel, progressPercent, accent = "neutral" }: StatTileProps) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      <span className={`text-2xl font-semibold ${accent === "success" ? "text-accent" : "text-fg"}`}>
        {value}
      </span>
      {sublabel && <span className="text-xs text-fg-subtle">{sublabel}</span>}
      {progressPercent !== undefined && (
        <ProgressBar percent={progressPercent} color={accent === "success" ? "accent" : "neutral"} />
      )}
    </Card>
  );
}
