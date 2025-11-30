import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Pill, Calendar } from "lucide-react";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { UsageLog } from "@shared/schema";

export default function HistoryPage() {
  const { data: usageLogs, isLoading } = useQuery<UsageLog[]>({
    queryKey: ["/api/usage"],
  });

  const groupedByDate = usageLogs?.reduce((acc, log) => {
    const date = format(new Date(log.timestamp), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, UsageLog[]>) || {};

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" data-testid="link-back-dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-history-title">
            Usage History
          </h1>
          <p className="text-lg text-muted-foreground">
            {usageLogs?.length || 0} doses recorded
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !usageLogs || usageLogs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No usage history</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Take your first medicine dose to see it here
            </p>
            <Button asChild>
              <Link href="/symptoms" data-testid="link-check-symptoms">
                Check Symptoms
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedByDate[date].map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                      data-testid={`history-log-${log._id}`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                        <Pill className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/medicine/${log.medicineId}`}>
                            <span className="font-semibold text-lg hover:underline cursor-pointer">
                              {log.medicineName}
                            </span>
                          </Link>
                          <span className="text-sm text-muted-foreground">
                            {log.dose} dose{log.dose > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium">
                          {format(new Date(log.timestamp), "h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </p>
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
