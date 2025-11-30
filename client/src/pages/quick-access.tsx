import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, Clock, TrendingUp, Pill } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicineCard } from "@/components/medicine-card";
import type { Medicine } from "@shared/schema";

export default function QuickAccessPage() {
  const { data: quickAccess, isLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines/quick-access"],
  });

  const { data: allMedicines } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const frequentlyUsed = allMedicines
    ?.filter(m => m.usageCount >= 5)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 4) || [];

  const recentlyUsed = allMedicines
    ?.filter(m => m.lastUsed)
    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
    .slice(0, 4) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" data-testid="link-back-dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-quick-access-title">
            Quick Access
          </h1>
          <p className="text-lg text-muted-foreground">
            Your most used and recently taken medicines
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">Frequently Used</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : frequentlyUsed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No frequently used medicines yet</p>
              <p className="text-sm">Medicines used 5+ times will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequentlyUsed.map((medicine) => (
                <div key={medicine._id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {medicine.usageCount}x used
                  </div>
                  <MedicineCard medicine={medicine} compact />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">Recently Used</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : recentlyUsed.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No recently used medicines</p>
              <p className="text-sm">Take a medicine to see it here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentlyUsed.map((medicine) => (
                <div key={medicine._id} className="relative">
                  {medicine.lastUsed && (
                    <div className="absolute -top-2 -right-2 z-10 bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded-full">
                      {formatDistanceToNow(new Date(medicine.lastUsed), { addSuffix: true })}
                    </div>
                  )}
                  <MedicineCard medicine={medicine} compact />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Pill className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">All Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : !quickAccess || quickAccess.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No quick access medicines</p>
              <p className="text-sm">Recently and frequently used medicines will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickAccess.map((medicine) => (
                <MedicineCard key={medicine._id} medicine={medicine} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
