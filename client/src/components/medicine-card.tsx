import { useMutation } from "@tanstack/react-query";
import { Check, Pill, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockBadge } from "./stock-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Medicine } from "@shared/schema";

interface MedicineCardProps {
  medicine: Medicine;
  selectedSymptoms?: string[];
  compact?: boolean;
}

export function MedicineCard({ medicine, selectedSymptoms = [], compact = false }: MedicineCardProps) {
  const { toast } = useToast();
  const [justTaken, setJustTaken] = useState(false);

  const takeDoseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/medicines/take-dose", {
        medicineId: medicine._id,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : medicine.symptoms.slice(0, 1),
      });
      return res.json();
    },
    onSuccess: () => {
      setJustTaken(true);
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/quick-access"] });
      toast({
        title: "Dose recorded",
        description: `${medicine.name} dose has been logged`,
      });
      setTimeout(() => setJustTaken(false), 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isOutOfStock = medicine.quantity === 0;

  if (compact) {
    return (
      <Card className="hover-elevate active-elevate-2 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base truncate" data-testid={`text-medicine-name-${medicine._id}`}>
                  {medicine.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{medicine.dosage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StockBadge quantity={medicine.quantity} size="sm" />
              {!isOutOfStock && (
                <Button
                  size="sm"
                  onClick={() => takeDoseMutation.mutate()}
                  disabled={takeDoseMutation.isPending || justTaken}
                  data-testid={`button-take-dose-${medicine._id}`}
                >
                  {justTaken ? <Check className="h-4 w-4" /> : "Take"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate active-elevate-2 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl" data-testid={`text-medicine-name-${medicine._id}`}>
                {medicine.name}
              </h3>
              <p className="text-muted-foreground text-base">{medicine.purpose || medicine.categoryName}</p>
            </div>
          </div>
          <StockBadge quantity={medicine.quantity} />
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-base">
            <span className="text-muted-foreground">Dosage:</span>{" "}
            <span className="font-medium">{medicine.dosage}</span>
          </p>
          {medicine.symptoms.length > 0 && (
            <p className="text-base">
              <span className="text-muted-foreground">Helps with:</span>{" "}
              <span className="font-medium">{medicine.symptoms.join(", ")}</span>
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 h-12 text-lg font-semibold"
            onClick={() => takeDoseMutation.mutate()}
            disabled={isOutOfStock || takeDoseMutation.isPending || justTaken}
            data-testid={`button-take-dose-${medicine._id}`}
          >
            {justTaken ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Taken
              </>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              "Take 1 Dose Now"
            )}
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12" asChild>
            <Link href={`/medicine/${medicine._id}`} data-testid={`link-medicine-details-${medicine._id}`}>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}