import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { createHash } from "crypto";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import {
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertPromotionSchema,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminEmail?: string;
  }
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "phillyzon-secret-key-change-me",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  await seedDatabase();

  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/menu-items", async (_req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.get("/api/menu-items/featured", async (_req, res) => {
    const items = await storage.getFeaturedItems();
    res.json(items);
  });

  app.get("/api/promotions/active", async (_req, res) => {
    const promos = await storage.getActivePromotions();
    res.json(promos);
  });

  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await storage.getAdminByEmail(email);
    if (!admin || admin.password !== hashPassword(password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    res.json({ email: admin.email });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/admin/session", (req, res) => {
    if (!req.session.adminId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ email: req.session.adminEmail });
  });

  app.get("/api/promotions", requireAdmin, async (_req, res) => {
    const promos = await storage.getPromotions();
    res.json(promos);
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    const parsed = insertMenuCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const cat = await storage.createCategory(parsed.data);
    res.json(cat);
  });

  app.patch("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const cat = await storage.updateCategory(id, req.body);
    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json(cat);
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/menu-items", requireAdmin, async (req, res) => {
    const parsed = insertMenuItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const item = await storage.createMenuItem(parsed.data);
    res.json(item);
  });

  app.patch("/api/admin/menu-items/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const item = await storage.updateMenuItem(id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/admin/menu-items/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteMenuItem(id);
    res.json({ message: "Deleted" });
  });

  app.post("/api/admin/promotions", requireAdmin, async (req, res) => {
    const parsed = insertPromotionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data" });
    const promo = await storage.createPromotion(parsed.data);
    res.json(promo);
  });

  app.patch("/api/admin/promotions/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const promo = await storage.updatePromotion(id, req.body);
    if (!promo) return res.status(404).json({ message: "Not found" });
    res.json(promo);
  });

  app.delete("/api/admin/promotions/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePromotion(id);
    res.json({ message: "Deleted" });
  });

  return httpServer;
}
