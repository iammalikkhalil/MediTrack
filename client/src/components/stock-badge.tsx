import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockBadgeProps {
  quantity: number;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

export function StockBadge({ quantity, showLabel = true, size = "default" }: StockBadgeProps) {
  const getStatus = () => {
    if (quantity === 0) return { label: "OUT", variant: "destructive" as const, icon: "circle-red" };
    if (quantity <= 3) return { label: `${quantity} left`, variant: "warning" as const, icon: "circle-yellow" };
    return { label: `${quantity} left`, variant: "success" as const, icon: "circle-green" };
  };

  const status = getStatus();
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5"
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        sizeClasses[size],
        "font-medium border-0",
        status.variant === "destructive" && "bg-destructive/15 text-destructive",
        status.variant === "warning" && "bg-warning/15 text-warning-foreground",
        status.variant === "success" && "bg-success/15 text-success"
      )}
      data-testid={`badge-stock-${quantity}`}
    >
      <span 
        className={cn(
          "w-2 h-2 rounded-full mr-2",
          status.variant === "destructive" && "bg-destructive",
          status.variant === "warning" && "bg-warning",
          status.variant === "success" && "bg-success"
        )} 
      />
      {showLabel ? status.label : quantity}
    </Badge>
  );
}
