import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Check, Pill, Clock, Edit2, Trash2, Save, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/stock-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMedicineSchema, SYMPTOMS, type Medicine, type UsageLog, type InsertMedicine } from "@shared/schema";

export default function MedicineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [justTaken, setJustTaken] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const { data: medicine, isLoading } = useQuery<Medicine>({
    queryKey: ["/api/medicines", id],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    select: (data) => data.map((c) => c.name)
  });

  const { data: usageLogs } = useQuery<UsageLog[]>({
    queryKey: ["/api/usage/medicine", id],
    enabled: !!id,
  });

  const form = useForm<InsertMedicine>({
    resolver: zodResolver(insertMedicineSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      categoryName: "Pain",
      purpose: "",
      usageNotes: "",
      dosage: "",
      quantity: 10,
      defaultQuantity: 10,
      symptoms: [],
    },
  });

  const takeDoseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/medicines/take-dose", {
        medicineId: id,
        symptoms: medicine?.symptoms.slice(0, 1) || [],
      });
      return res.json();
    },
    onSuccess: () => {
      setJustTaken(true);
      queryClient.invalidateQueries({ queryKey: ["/api/medicines", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/usage/medicine", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Dose recorded",
        description: `${medicine?.name} dose has been logged`,
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

  const updateMutation = useMutation({
    mutationFn: async (data: InsertMedicine) => {
      const res = await apiRequest("PUT", `/api/medicines/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Medicine updated",
        description: "Changes have been saved",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/medicines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Medicine deleted",
        description: "Medicine has been removed from your inventory",
      });
      navigate("/inventory");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startEditing = () => {
    if (medicine) {
      form.reset({
        name: medicine.name,
        categoryId: medicine.categoryId,
        categoryName: medicine.categoryName,
        purpose: medicine.purpose || "",
        usageNotes: medicine.usageNotes || "",
        dosage: medicine.dosage,
        quantity: medicine.quantity,
        defaultQuantity: medicine.defaultQuantity,
        symptoms: medicine.symptoms,
      });
      setSelectedSymptoms(medicine.symptoms);
      setIsEditing(true);
    }
  };

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(newSymptoms);
    form.setValue("symptoms", newSymptoms);
  };

  const onSubmit = (data: InsertMedicine) => {
    updateMutation.mutate({ ...data, symptoms: selectedSymptoms });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-16">
        <Pill className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Medicine not found</h2>
        <p className="text-muted-foreground mb-6">
          This medicine may have been deleted
        </p>
        <Button asChild>
          <Link href="/inventory">Back to Inventory</Link>
        </Button>
      </div>
    );
  }

  const isOutOfStock = medicine.quantity === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory" data-testid="link-back-inventory">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-medicine-name">
              {medicine.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {medicine.categoryName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={startEditing} data-testid="button-edit-medicine">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" data-testid="button-delete-medicine">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {medicine.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove this medicine from your inventory. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Edit Medicine</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Medicine Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg" data-testid="input-edit-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Dosage Instructions</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg" data-testid="input-edit-dosage" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Current Quantity</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="h-12 text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Default Restock</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                            className="h-12 text-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Purpose</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel className="text-base">Symptoms it helps with</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SYMPTOMS.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                        className="cursor-pointer text-sm py-1.5 px-3"
                        onClick={() => toggleSymptom(symptom)}
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-lg font-semibold"
                    disabled={updateMutation.isPending}
                    data-testid="button-save-changes"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
                    <Pill className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{medicine.name}</h2>
                    <p className="text-lg text-muted-foreground">{medicine.purpose || medicine.categoryName}</p>
                  </div>
                </div>
                <StockBadge quantity={medicine.quantity} size="lg" />
              </div>

              <div className="space-y-4 mb-8">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Dosage</p>
                  <p className="text-xl font-medium">{medicine.dosage}</p>
                </div>
                {medicine.symptoms.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Helps with</p>
                    <div className="flex flex-wrap gap-2">
                      {medicine.symptoms.map((symptom) => (
                        <Badge key={symptom} variant="secondary" className="text-base py-1 px-3">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full h-16 text-xl font-bold"
                onClick={() => takeDoseMutation.mutate()}
                disabled={isOutOfStock || takeDoseMutation.isPending || justTaken}
                data-testid="button-take-dose"
              >
                {justTaken ? (
                  <>
                    <Check className="mr-2 h-6 w-6" />
                    Dose Recorded
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  "Take 1 Dose Now"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-xl">Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              {!usageLogs || usageLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No usage history yet</p>
                  <p className="text-sm">Take a dose to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usageLogs.slice(0, 10).map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between gap-4 p-4 rounded-lg bg-muted/50"
                      data-testid={`usage-log-${log._id}`}
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.symptoms.join(", ")}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}