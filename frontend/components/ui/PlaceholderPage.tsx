import { Card } from "@/components/ui/Card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  nextStep: string;
}

export function PlaceholderPage({ title, description, nextStep }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        <p className="text-sm text-fg-muted">{description}</p>
      </div>
      <Card>
        <p className="text-sm text-fg-muted">{nextStep}</p>
      </Card>
    </div>
  );
}
