import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import {
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertPromotionSchema,
} from "@shared/schema";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

declare module "express-session" {
  interface SessionData {
    adminId?: number;
    adminEmail?: string;
  }
}

const BCRYPT_ROUNDS = 10;

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

  app.use("/uploads", express.static(uploadsDir));

  app.post("/api/admin/upload", requireAdmin, (req: Request, res: Response) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
        }
        if (err.message === "Only image files are allowed") {
          return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    });
  });

  app.delete("/api/admin/upload", requireAdmin, (req: Request, res: Response) => {
    const { imageUrl } = req.body;
    if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(uploadsDir, path.basename(imageUrl));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ message: "Deleted" });
  });

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
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
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
    const id = parseInt(req.params.id as string);
    const cat = await storage.updateCategory(id, req.body);
    if (!cat) return res.status(404).json({ message: "Not found" });
    res.json(cat);
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
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
    const id = parseInt(req.params.id as string);
    const item = await storage.updateMenuItem(id, req.body);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  });

  app.delete("/api/admin/menu-items/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
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
    const id = parseInt(req.params.id as string);
    const promo = await storage.updatePromotion(id, req.body);
    if (!promo) return res.status(404).json({ message: "Not found" });
    res.json(promo);
  });

  app.delete("/api/admin/promotions/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
    await storage.deletePromotion(id);
    res.json({ message: "Deleted" });
  });

  return httpServer;
}
