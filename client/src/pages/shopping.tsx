import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Check, Package, Printer } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StockBadge } from "@/components/stock-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Medicine, Category } from "@shared/schema";

export default function ShoppingPage() {
  const { toast } = useToast();

  const { data: lowStock, isLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines/low-stock"],
  });

  const restockMutation = useMutation({
    mutationFn: async (medicineId: string) => {
      const res = await apiRequest("POST", "/api/medicines/restock", { medicineId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/low-stock"] });
      toast({
        title: "Restocked",
        description: "Medicine has been marked as restocked",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const restockAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/medicines/restock-all");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines/low-stock"] });
      toast({
        title: "All Restocked",
        description: "All medicines have been marked as restocked",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const groupedByCategory = lowStock?.reduce((acc, medicine) => {
    const category = medicine.categoryName;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(medicine);
    return acc;
  }, {} as Record<string, Medicine[]>) || {};

  const outOfStockCount = lowStock?.filter(m => m.quantity === 0).length || 0;
  const lowStockCount = lowStock?.filter(m => m.quantity > 0).length || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" data-testid="link-back-dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-shopping-title">
              Need to Buy
            </h1>
            <p className="text-lg text-muted-foreground">
              {outOfStockCount > 0 && `${outOfStockCount} out of stock`}
              {outOfStockCount > 0 && lowStockCount > 0 && " • "}
              {lowStockCount > 0 && `${lowStockCount} running low`}
              {outOfStockCount === 0 && lowStockCount === 0 && "All stocked up!"}
            </p>
          </div>
        </div>
        {lowStock && lowStock.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrint}
              data-testid="button-print-list"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print List
            </Button>
            <Button
              onClick={() => restockAllMutation.mutate()}
              disabled={restockAllMutation.isPending}
              data-testid="button-mark-all-bought"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Bought
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !lowStock || lowStock.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-20 w-20 mx-auto mb-6 text-success opacity-70" />
            <h2 className="text-2xl font-bold mb-2">All Stocked Up!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              You have enough of all your medicines
            </p>
            <Button asChild>
              <Link href="/inventory" data-testid="link-view-inventory">
                View Inventory
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 print:space-y-4">
          {Object.entries(groupedByCategory).map(([category, medicines]) => (
            <Card key={category} className="print:break-inside-avoid">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground print:hidden" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medicines.map((medicine) => (
                    <div
                      key={medicine._id}
                      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      data-testid={`shopping-item-${medicine._id}`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {medicine.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {medicine.purpose || medicine.dosage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StockBadge quantity={medicine.quantity} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restockMutation.mutate(medicine._id)}
                          disabled={restockMutation.isPending}
                          className="print:hidden"
                          data-testid={`button-restock-${medicine._id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Bought
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}