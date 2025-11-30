import { ObjectId } from "mongodb";
import { getMedicinesCollection, getUsageLogsCollection, getCategoriesCollection, toObjectId } from "./mongodb";
import type { Medicine, InsertMedicine, UsageLog, InsertUsageLog, Category, InsertCategory } from "@shared/schema";

export interface IStorage {
  getAllMedicines(): Promise<Medicine[]>;
  getMedicineById(id: string): Promise<Medicine | null>;
  getMedicinesBySymptoms(symptoms: string[]): Promise<Medicine[]>;
  getQuickAccessMedicines(): Promise<Medicine[]>;
  getLowStockMedicines(): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: string, updates: Partial<InsertMedicine>): Promise<Medicine | null>;
  deleteMedicine(id: string): Promise<boolean>;
  takeDose(medicineId: string, symptoms: string[]): Promise<{ medicine: Medicine; log: UsageLog } | null>;
  restockMedicine(medicineId: string): Promise<Medicine | null>;
  restockAllMedicines(): Promise<number>;
  
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | null>;
  softDeleteCategory(id: string): Promise<boolean>;
  
  getAllUsageLogs(): Promise<UsageLog[]>;
  getUsageLogsByMedicine(medicineId: string): Promise<UsageLog[]>;
  createUsageLog(log: InsertUsageLog): Promise<UsageLog>;
}

export class MongoStorage implements IStorage {
  async getAllCategories(): Promise<Category[]> {
    const collection = await getCategoriesCollection();
    const categories = await collection.find({ isDeleted: { $ne: true } }).sort({ name: 1 }).toArray();
    return categories.map(this.formatCategory);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const collection = await getCategoriesCollection();
      const category = await collection.findOne({ 
        _id: toObjectId(id),
        isDeleted: { $ne: true }
      });
      return category ? this.formatCategory(category) : null;
    } catch {
      return null;
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const collection = await getCategoriesCollection();
    const now = new Date().toISOString();
    
    const newCategory = {
      ...category,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await collection.insertOne(newCategory);
    return this.formatCategory({ ...newCategory, _id: result.insertedId });
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | null> {
    try {
      const collection = await getCategoriesCollection();
      const result = await collection.findOneAndUpdate(
        { _id: toObjectId(id), isDeleted: { $ne: true } },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        },
        { returnDocument: "after" }
      );
      
      return result ? this.formatCategory(result) : null;
    } catch {
      return null;
    }
  }

  async softDeleteCategory(id: string): Promise<boolean> {
    try {
      const collection = await getCategoriesCollection();
      const result = await collection.updateOne(
        { _id: toObjectId(id), isDeleted: { $ne: true } },
        { 
          $set: { 
            isDeleted: true,
            updatedAt: new Date().toISOString() 
          } 
        }
      );
      return result.modifiedCount > 0;
    } catch {
      return false;
    }
  }

  async getAllMedicines(): Promise<Medicine[]> {
    const collection = await getMedicinesCollection();
    const medicines = await collection.find({}).sort({ name: 1 }).toArray();
    return medicines.map(this.formatMedicine);
  }

  async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const collection = await getMedicinesCollection();
      const medicine = await collection.findOne({ _id: toObjectId(id) });
      return medicine ? this.formatMedicine(medicine) : null;
    } catch {
      return null;
    }
  }

  async getMedicinesBySymptoms(symptoms: string[]): Promise<Medicine[]> {
    const collection = await getMedicinesCollection();
    const medicines = await collection.find({
      symptoms: { $in: symptoms }
    }).toArray();
    
    return medicines
      .map(this.formatMedicine)
      .sort((a, b) => {
        const aMatches = a.symptoms.filter(s => symptoms.includes(s)).length;
        const bMatches = b.symptoms.filter(s => symptoms.includes(s)).length;
        
        if (a.quantity === 0 && b.quantity > 0) return 1;
        if (b.quantity === 0 && a.quantity > 0) return -1;
        
        if (bMatches !== aMatches) return bMatches - aMatches;
        
        return b.usageCount - a.usageCount;
      });
  }

  async getQuickAccessMedicines(): Promise<Medicine[]> {
    const collection = await getMedicinesCollection();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const medicines = await collection.find({
      $or: [
        { lastUsed: { $gte: sevenDaysAgo.toISOString() } },
        { usageCount: { $gte: 5 } },
        { isQuickAccess: true }
      ]
    }).sort({ lastUsed: -1, usageCount: -1 }).limit(8).toArray();
    
    return medicines.map(this.formatMedicine);
  }

  async getLowStockMedicines(): Promise<Medicine[]> {
    const collection = await getMedicinesCollection();
    const medicines = await collection.find({
      quantity: { $lte: 3 }
    }).sort({ quantity: 1, name: 1 }).toArray();
    
    return medicines.map(this.formatMedicine);
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const collection = await getMedicinesCollection();
    const now = new Date().toISOString();
    
    const newMedicine = {
      ...medicine,
      usageCount: 0,
      lastUsed: null,
      isQuickAccess: false,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await collection.insertOne(newMedicine);
    return this.formatMedicine({ ...newMedicine, _id: result.insertedId });
  }

  async updateMedicine(id: string, updates: Partial<InsertMedicine>): Promise<Medicine | null> {
    try {
      const collection = await getMedicinesCollection();
      const result = await collection.findOneAndUpdate(
        { _id: toObjectId(id) },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date().toISOString() 
          } 
        },
        { returnDocument: "after" }
      );
      
      return result ? this.formatMedicine(result) : null;
    } catch {
      return null;
    }
  }

  async deleteMedicine(id: string): Promise<boolean> {
    try {
      const collection = await getMedicinesCollection();
      const result = await collection.deleteOne({ _id: toObjectId(id) });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }

  async takeDose(medicineId: string, symptoms: string[]): Promise<{ medicine: Medicine; log: UsageLog } | null> {
    try {
      const collection = await getMedicinesCollection();
      const medicine = await collection.findOne({ _id: toObjectId(medicineId) });
      
      if (!medicine || medicine.quantity <= 0) {
        return null;
      }
      
      const now = new Date().toISOString();
      
      const updatedMedicine = await collection.findOneAndUpdate(
        { _id: toObjectId(medicineId) },
        {
          $inc: { quantity: -1, usageCount: 1 },
          $set: { 
            lastUsed: now, 
            updatedAt: now,
            isQuickAccess: true
          }
        },
        { returnDocument: "after" }
      );
      
      if (!updatedMedicine) return null;
      
      const log = await this.createUsageLog({
        medicineId,
        medicineName: medicine.name,
        dose: 1,
        symptoms,
        wasEffective: null,
      });
      
      return { 
        medicine: this.formatMedicine(updatedMedicine), 
        log 
      };
    } catch {
      return null;
    }
  }

  async restockMedicine(medicineId: string): Promise<Medicine | null> {
    try {
      const collection = await getMedicinesCollection();
      const medicine = await collection.findOne({ _id: toObjectId(medicineId) });
      
      if (!medicine) return null;
      
      const result = await collection.findOneAndUpdate(
        { _id: toObjectId(medicineId) },
        {
          $set: { 
            quantity: medicine.defaultQuantity || 10,
            updatedAt: new Date().toISOString()
          }
        },
        { returnDocument: "after" }
      );
      
      return result ? this.formatMedicine(result) : null;
    } catch {
      return null;
    }
  }

  async restockAllMedicines(): Promise<number> {
    const collection = await getMedicinesCollection();
    const lowStockMedicines = await collection.find({ quantity: { $lte: 3 } }).toArray();
    
    let restocked = 0;
    for (const medicine of lowStockMedicines) {
      await collection.updateOne(
        { _id: medicine._id },
        {
          $set: { 
            quantity: medicine.defaultQuantity || 10,
            updatedAt: new Date().toISOString()
          }
        }
      );
      restocked++;
    }
    
    return restocked;
  }

  async getAllUsageLogs(): Promise<UsageLog[]> {
    const collection = await getUsageLogsCollection();
    const logs = await collection.find({}).sort({ timestamp: -1 }).limit(100).toArray();
    return logs.map(this.formatUsageLog);
  }

  async getUsageLogsByMedicine(medicineId: string): Promise<UsageLog[]> {
    const collection = await getUsageLogsCollection();
    const logs = await collection.find({ medicineId }).sort({ timestamp: -1 }).limit(50).toArray();
    return logs.map(this.formatUsageLog);
  }

  async createUsageLog(log: InsertUsageLog): Promise<UsageLog> {
    const collection = await getUsageLogsCollection();
    const newLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };
    
    const result = await collection.insertOne(newLog);
    return this.formatUsageLog({ ...newLog, _id: result.insertedId });
  }

  private formatCategory(doc: any): Category {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  private formatMedicine(doc: any): Medicine {
    return {
      _id: doc._id.toString(),
      name: doc.name,
      categoryId: doc.categoryId,
      categoryName: doc.categoryName,
      purpose: doc.purpose || "",
      usageNotes: doc.usageNotes || "",
      dosage: doc.dosage,
      quantity: doc.quantity,
      defaultQuantity: doc.defaultQuantity || 10,
      symptoms: doc.symptoms || [],
      usageCount: doc.usageCount || 0,
      lastUsed: doc.lastUsed || null,
      isQuickAccess: doc.isQuickAccess || false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private formatUsageLog(doc: any): UsageLog {
    return {
      _id: doc._id.toString(),
      medicineId: doc.medicineId,
      medicineName: doc.medicineName,
      dose: doc.dose || 1,
      symptoms: doc.symptoms || [],
      timestamp: doc.timestamp,
      wasEffective: doc.wasEffective ?? null,
    };
  }
}

export const storage = new MongoStorage();