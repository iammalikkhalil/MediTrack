import { cn } from "@/lib/utils";

interface SymptomButtonProps {
  symptom: string;
  icon: string;
  isSelected: boolean;
  isRecent?: boolean;
  onClick: () => void;
}

export function SymptomButton({ symptom, icon, isSelected, isRecent, onClick }: SymptomButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 transition-all min-h-[120px]",
        "hover-elevate active-elevate-2",
        isSelected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50"
      )}
      data-testid={`button-symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {isRecent && (
        <span className="absolute top-2 right-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Recent
        </span>
      )}
      <span className="text-3xl">{icon}</span>
      <span className="font-semibold text-lg text-center">{symptom}</span>
    </button>
  );
}

export const SYMPTOM_ICONS: Record<string, string> = {
  "Fever": "🤒",
  "Headache": "🤕",
  "Nausea": "🤢",
  "Cold & Flu": "🤧",
  "Body Pain": "💊",
  "Allergy": "🤒",
  "Stomach": "🤢",
  "Sleep Aid": "🛌",
  "Anxiety": "😨",
};
