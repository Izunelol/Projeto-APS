type ToneColor = "success" | "warning" | "danger";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  tone?: ToneColor;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const toneClasses: Record<ToneColor, string> = {
  success: "bg-accent text-accent-fg border-accent",
  warning: "bg-warning text-accent-fg border-warning",
  danger: "bg-danger text-white border-danger",
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        const selectedClasses = option.tone
          ? toneClasses[option.tone]
          : "bg-accent text-accent-fg border-accent";
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              selected
                ? selectedClasses
                : "border-border bg-surface-alt text-fg-muted hover:text-fg"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
