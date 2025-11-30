import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Pill, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickActionButton } from "@/components/quick-action-button";
import { MedicineCard } from "@/components/medicine-card";
import { LowStockAlert } from "@/components/low-stock-alert";
import type { Medicine, UsageLog } from "@shared/schema";

export default function DashboardPage() {
  const { data: medicines, isLoading: medicinesLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"],
  });

  const { data: quickAccess, isLoading: quickAccessLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines/quick-access"],
  });

  const { data: usageLogs, isLoading: usageLoading } = useQuery<UsageLog[]>({
    queryKey: ["/api/usage"],
  });

  const { data: lowStock } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines/low-stock"],
  });

  const recentUsage = usageLogs?.slice(0, 3) || [];
  const allMedicines = medicines || [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Not feeling well?
        </h1>
        <p className="text-lg text-muted-foreground">
          Let's find the right medicine for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionButton
          icon="🤒"
          label="I Have Symptoms"
          href="/symptoms"
          variant="primary"
        />
        <QuickActionButton
          icon="💊"
          label="Quick Access"
          href="/quick-access"
          variant="secondary"
        />
        <QuickActionButton
          icon="🛒"
          label="Need to Buy"
          href="/shopping"
          variant="accent"
        />
      </div>

      {lowStock && lowStock.length > 0 && (
        <LowStockAlert medicines={lowStock} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentUsage.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No recent activity</p>
                <p className="text-sm">Take a medicine to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsage.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    data-testid={`activity-log-${log._id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.medicineName}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.symptoms.join(", ")}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Quick Access Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            {quickAccessLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !quickAccess || quickAccess.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No quick access medicines</p>
                <p className="text-sm">Frequently used medicines will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quickAccess.slice(0, 4).map((medicine) => (
                  <MedicineCard key={medicine._id} medicine={medicine} compact />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <Pill className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">All Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          {medicinesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : allMedicines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Pill className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl mb-2">No medicines yet</p>
              <p className="text-base">Add your first medicine from the inventory page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allMedicines.slice(0, 6).map((medicine) => (
                <MedicineCard key={medicine._id} medicine={medicine} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
