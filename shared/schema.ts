import { z } from "zod";

export const categorySchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const insertCategorySchema = categorySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true
});

export type Category = z.infer<typeof categorySchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const SYMPTOMS = [
  "Fever",
  "Headache", 
  "Nausea",
  "Cold & Flu",
  "Body Pain",
  "Allergy",
  "Stomach",
  "Sleep Aid",
  "Anxiety"
] as const;
export type Symptom = typeof SYMPTOMS[number];

export const medicineSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  categoryId: z.string().min(1, "Category ID is required"),
  categoryName: z.string().min(1, "Category name is required"),
  purpose: z.string().optional(),
  usageNotes: z.string().optional(),
  dosage: z.string(),
  quantity: z.number().min(0),
  defaultQuantity: z.number().min(1).default(10),
  symptoms: z.array(z.string()),
  usageCount: z.number().default(0),
  lastUsed: z.string().nullable().optional(),
  isQuickAccess: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertMedicineSchema = medicineSchema.omit({ 
  _id: true, 
  usageCount: true, 
  lastUsed: true,
  isQuickAccess: true,
  createdAt: true, 
  updatedAt: true 
});

export type Medicine = z.infer<typeof medicineSchema>;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;

export const usageLogSchema = z.object({
  _id: z.string(),
  medicineId: z.string(),
  medicineName: z.string(),
  dose: z.number().default(1),
  symptoms: z.array(z.string()),
  timestamp: z.string(),
  wasEffective: z.boolean().nullable().optional(),
});

export const insertUsageLogSchema = usageLogSchema.omit({ 
  _id: true, 
  timestamp: true 
});

export type UsageLog = z.infer<typeof usageLogSchema>;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface User {
  id: string;
  username: string;
}

export type InsertUser = {
  username: string;
  password: string;
};

export function getStockStatus(quantity: number): "in-stock" | "low" | "out" {
  if (quantity === 0) return "out";
  if (quantity <= 3) return "low";
  return "in-stock";
}

export function getStockColor(quantity: number): string {
  const status = getStockStatus(quantity);
  switch (status) {
    case "out": return "destructive";
    case "low": return "warning";
    default: return "success";
  }
}