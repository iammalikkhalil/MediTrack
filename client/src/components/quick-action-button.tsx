import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "accent";
}

export function QuickActionButton({ icon, label, href, variant = "primary" }: QuickActionButtonProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all cursor-pointer",
          "hover-elevate active-elevate-2 min-h-[140px] md:min-h-[160px]",
          variant === "primary" && "bg-primary text-primary-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground",
          variant === "accent" && "bg-accent text-accent-foreground"
        )}
        data-testid={`button-quick-action-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <span className="text-4xl md:text-5xl">{icon}</span>
        <span className="font-bold text-lg md:text-xl text-center">{label}</span>
      </div>
    </Link>
  );
}
