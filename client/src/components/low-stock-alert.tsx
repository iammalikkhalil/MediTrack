import { AlertTriangle, ShoppingCart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Medicine } from "@shared/schema";

interface LowStockAlertProps {
  medicines: Medicine[];
}

export function LowStockAlert({ medicines }: LowStockAlertProps) {
  const outOfStock = medicines.filter(m => m.quantity === 0);
  const lowStock = medicines.filter(m => m.quantity > 0 && m.quantity <= 3);

  if (outOfStock.length === 0 && lowStock.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1">Stock Alert</h3>
          <div className="space-y-1 text-sm">
            {outOfStock.length > 0 && (
              <p className="text-destructive font-medium">
                {outOfStock.length} medicine{outOfStock.length > 1 ? "s" : ""} out of stock
              </p>
            )}
            {lowStock.length > 0 && (
              <p className="text-muted-foreground">
                {lowStock.length} medicine{lowStock.length > 1 ? "s" : ""} running low
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/shopping" data-testid="link-shopping-list">
            <ShoppingCart className="h-4 w-4 mr-2" />
            View List
          </Link>
        </Button>
      </div>
    </div>
  );
}
