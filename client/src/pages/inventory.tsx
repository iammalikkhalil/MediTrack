import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus, Pill, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { MedicineCard } from "@/components/medicine-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMedicineSchema, SYMPTOMS, type Medicine, type InsertMedicine } from "@shared/schema";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'medicines' | 'categories'>('medicines');
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: medicines, isLoading } = useQuery<Medicine[]>({
    queryKey: ["/api/medicines"]
  });

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"]
  });

  const categoryForm = useForm({
    defaultValues: {
      name: ""
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category added",
        description: "New category has been created"
      });
      setIsCategoryDialogOpen(false);
      categoryForm.reset();
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PUT", `/api/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category updated",
        description: "Category has been updated"
      });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      categoryForm.reset();
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "Category has been removed"
      });
    }
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

  const createMutation = useMutation({
    mutationFn: async (data: InsertMedicine) => {
      const res = await apiRequest("POST", "/api/medicines", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Medicine added",
        description: "New medicine has been added to your inventory",
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedSymptoms([]);
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
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/medicines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medicines"] });
      toast({
        title: "Medicine deleted",
        description: "Medicine has been removed from your inventory",
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

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];
    setSelectedSymptoms(newSymptoms);
    form.setValue("symptoms", newSymptoms);
  };

  const onSubmit = (data: InsertMedicine) => {
    createMutation.mutate({ ...data, symptoms: selectedSymptoms });
  };

  const filteredMedicines = filterCategory === "all" 
    ? medicines 
    : medicines?.filter(m => m.categoryName === filterCategory);

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <Button
          variant="ghost"
          className={`rounded-none ${activeTab === 'medicines' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('medicines')}
        >
          Medicines
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none ${activeTab === 'categories' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </Button>
      </div>

      {/* Medicines Tab */}
      {activeTab === 'medicines' && (
        <>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/" data-testid="link-back-dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-inventory-title">
                  Medicine Inventory
                </h1>
                <p className="text-lg text-muted-foreground">
                  {medicines?.length || 0} medicines in your kit
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" data-testid="button-add-medicine">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Medicine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Add New Medicine</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Medicine Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Paracetamol 500mg"
                              className="h-12 text-lg"
                              data-testid="input-medicine-name"
                            />
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
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("categoryName", value);
                            }} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg" data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category._id || category.name} value={category.name}>
                                  {category.name}
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
                            <Input
                              {...field}
                              placeholder="e.g., 1 tablet every 6 hours"
                              className="h-12 text-lg"
                              data-testid="input-dosage"
                            />
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
                                data-testid="input-quantity"
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
                                data-testid="input-default-quantity"
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
                          <FormLabel className="text-base">Purpose (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., Reduces fever and relieves pain"
                              className="h-12 text-lg"
                              data-testid="input-purpose"
                            />
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
                            data-testid={`badge-symptom-${symptom.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline" className="flex-1 h-12">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-lg font-semibold"
                        disabled={createMutation.isPending}
                        data-testid="button-save-medicine"
                      >
                        {createMutation.isPending ? "Saving..." : "Save Medicine"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterCategory === "all" ? "default" : "outline"}
              onClick={() => setFilterCategory("all")}
              data-testid="filter-all"
            >
              All
            </Button>
            {categories.map((category: any) => (
              <Button
                key={category._id || category.name}
                variant={filterCategory === category.name ? "default" : "outline"}
                onClick={() => setFilterCategory(category.name)}
                data-testid={`filter-${category.name?.toLowerCase() || 'all'}`}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Medicine List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : !filteredMedicines || filteredMedicines.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Pill className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-bold mb-2">
                  {filterCategory === "all" ? "No medicines yet" : `No ${filterCategory} medicines`}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {filterCategory === "all" 
                    ? "Add your first medicine to get started"
                    : "Add medicines to this category"}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Medicine
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.map((medicine) => (
                <Card key={medicine._id} className="relative group">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        data-testid={`button-delete-${medicine._id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
                          onClick={() => deleteMutation.mutate(medicine._id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <MedicineCard medicine={medicine} />
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="lg" onClick={() => {
              setEditingCategory(null);
              categoryForm.reset({ name: "" });
              setIsCategoryDialogOpen(true);
            }}>
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No categories yet. Add your first category to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {categories.map((category: any) => (
                    <div key={category._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            categoryForm.reset({ name: category.name });
                            setIsCategoryDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this category. Medicines in this category will not be deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCategoryMutation.mutate(category._id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <Form {...categoryForm}>
            <form 
              onSubmit={categoryForm.handleSubmit((data) => {
                if (editingCategory) {
                  updateCategoryMutation.mutate({ id: editingCategory._id, data });
                } else {
                  createCategoryMutation.mutate(data);
                }
              })}
              className="space-y-4"
            >
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Pain Relief" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCategoryDialogOpen(false);
                    setEditingCategory(null);
                    categoryForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending 
                    ? "Saving..." 
                    : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}