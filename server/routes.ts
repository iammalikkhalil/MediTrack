import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { connectToMongoDB } from "./mongodb";
import { insertMedicineSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

const VALID_USERNAME = "admin";
const VALID_PASSWORD = "medkit123";

const SESSION_COOKIE_NAME = "medkit_session";
const sessions = new Map<string, { username: string; expiresAt: Date }>();

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isAuthenticated(req: Request): boolean {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionId) return false;
  
  const session = sessions.get(sessionId);
  if (!session) return false;
  
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return false;
  }
  
  return true;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await connectToMongoDB();

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password, rememberMe } = req.body;
      
      if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const sessionId = generateSessionId();
      const expiresAt = new Date();
      
      if (rememberMe) {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24);
      }
      
      sessions.set(sessionId, { username, expiresAt });
      
      res.cookie(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
      });
      
      res.json({ success: true, username });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    res.json({ success: true });
  });

  app.get("/api/auth/check", (req: Request, res: Response) => {
    const authenticated = isAuthenticated(req);
    res.json({ authenticated });
  });

  app.get("/api/medicines", requireAuth, async (req: Request, res: Response) => {
    try {
      const medicines = await storage.getAllMedicines();
      res.json(medicines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/medicines/quick-access", requireAuth, async (req: Request, res: Response) => {
    try {
      const medicines = await storage.getQuickAccessMedicines();
      res.json(medicines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/medicines/low-stock", requireAuth, async (req: Request, res: Response) => {
    try {
      const medicines = await storage.getLowStockMedicines();
      res.json(medicines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/medicines/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const medicine = await storage.getMedicineById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/medicines", requireAuth, async (req: Request, res: Response) => {
    try {
      const validated = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(validated);
      res.status(201).json(medicine);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/medicines/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validated = insertMedicineSchema.partial().parse(req.body);
      const medicine = await storage.updateMedicine(req.params.id, validated);
      if (!medicine) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/medicines/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteMedicine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/medicines/take-dose", requireAuth, async (req: Request, res: Response) => {
    try {
      const { medicineId, symptoms } = req.body;
      
      if (!medicineId) {
        return res.status(400).json({ error: "Medicine ID is required" });
      }
      
      const result = await storage.takeDose(medicineId, symptoms || []);
      if (!result) {
        return res.status(400).json({ error: "Could not take dose - medicine not found or out of stock" });
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/medicines/restock", requireAuth, async (req: Request, res: Response) => {
    try {
      const { medicineId } = req.body;
      
      if (!medicineId) {
        return res.status(400).json({ error: "Medicine ID is required" });
      }
      
      const medicine = await storage.restockMedicine(medicineId);
      if (!medicine) {

  // Category routes
  app.get("/api/categories", requireAuth, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/categories", requireAuth, async (req: Request, res: Response) => {
    try {
      const validated = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validated);
      res.status(201).json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const validated = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, validated);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.softDeleteCategory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
        return res.status(404).json({ error: "Medicine not found" });
      }
      
      res.json(medicine);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/medicines/restock-all", requireAuth, async (req: Request, res: Response) => {
    try {
      const count = await storage.restockAllMedicines();
      res.json({ success: true, restockedCount: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/symptoms/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const symptoms = req.query.symptoms;
      
      if (!symptoms) {
        return res.json([]);
      }
      
      const symptomArray = Array.isArray(symptoms) 
        ? symptoms as string[] 
        : [symptoms as string];
      
      const medicines = await storage.getMedicinesBySymptoms(symptomArray);
      res.json(medicines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/symptoms/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const { symptoms } = req.body;
      
      if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
        return res.json([]);
      }
      
      const medicines = await storage.getMedicinesBySymptoms(symptoms);
      res.json(medicines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/usage", requireAuth, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getAllUsageLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/usage/medicine/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const logs = await storage.getUsageLogsByMedicine(req.params.id);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}