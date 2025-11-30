import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Pill } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SymptomButton, SYMPTOM_ICONS } from "@/components/symptom-button";
import { MedicineCard } from "@/components/medicine-card";
import { SYMPTOMS, type Medicine, type UsageLog } from "@shared/schema";

export default function SymptomsPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { data: recentUsage } = useQuery<UsageLog[]>({
    queryKey: ["/api/usage"],
  });

  const { data: searchResults, isLoading: searchLoading, refetch: refetchSearch } = useQuery<Medicine[]>({
    queryKey: ["/api/symptoms/search", selectedSymptoms.join(",")],
    queryFn: async () => {
      const res = await fetch("/api/symptoms/search?" + selectedSymptoms.map(s => `symptoms=${encodeURIComponent(s)}`).join("&"), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: showResults && selectedSymptoms.length > 0,
  });

  const recentSymptoms = Array.from(
    new Set(
      recentUsage
        ?.filter(log => {
          const logDate = new Date(log.timestamp);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return logDate >= thirtyDaysAgo;
        })
        .flatMap(log => log.symptoms) || []
    )
  ).slice(0, 3);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
    setShowResults(false);
  };

  const handleSearch = () => {
    if (selectedSymptoms.length > 0) {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowResults(false)}
            data-testid="button-back-to-symptoms"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Recommended Medicines</h1>
            <p className="text-muted-foreground">
              For: {selectedSymptoms.join(", ")}
            </p>
          </div>
        </div>

        {searchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : !searchResults || searchResults.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Pill className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl font-medium mb-2">No medicines found</p>
              <p className="text-muted-foreground mb-4">
                You don't have any medicines for these symptoms
              </p>
              <Button asChild>
                <Link href="/inventory" data-testid="link-add-medicine">
                  Add Medicine
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((medicine) => (
              <MedicineCard
                key={medicine._id}
                medicine={medicine}
                selectedSymptoms={selectedSymptoms}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" data-testid="link-back-dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-symptoms-title">
            How are you feeling today?
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your symptoms to find the right medicine
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Common Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SYMPTOMS.map((symptom) => (
              <SymptomButton
                key={symptom}
                symptom={symptom}
                icon={SYMPTOM_ICONS[symptom] || "\u{1F48A}"}
                isSelected={selectedSymptoms.includes(symptom)}
                isRecent={recentSymptoms.includes(symptom)}
                onClick={() => toggleSymptom(symptom)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {recentSymptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Recent Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recentSymptoms.map((symptom) => (
                <Button
                  key={symptom}
                  variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                  className="h-12 text-base"
                  onClick={() => toggleSymptom(symptom)}
                  data-testid={`button-recent-symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {SYMPTOM_ICONS[symptom] || "\u{1F48A}"} {symptom}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-4 z-10">
        <Button
          className="w-full h-14 text-xl font-semibold shadow-lg"
          onClick={handleSearch}
          disabled={selectedSymptoms.length === 0}
          data-testid="button-find-medicines"
        >
          <Search className="mr-2 h-5 w-5" />
          Find Medicines ({selectedSymptoms.length} selected)
        </Button>
      </div>
    </div>
  );
}
