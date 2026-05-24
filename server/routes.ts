import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import multer from "multer";
import express from "express";
import { storage } from "./storage";
import { pool } from "./db";
import { seedDatabase } from "./seed";
import { uploadToS3, deleteFromS3 } from "./s3";
import {
  insertMenuCategorySchema,
  insertMenuItemSchema,
  insertPromotionSchema,
  createOrderRequestSchema,
  orderStatusEnum,
} from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
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
  const PgStore = connectPg(session);
  app.use(
    session({
      store:
        process.env.NODE_ENV === "production"
          ? new PgStore({ pool, createTableIfMissing: true })
          : undefined,
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  await seedDatabase();

  app.post("/api/admin/upload", requireAdmin, (req: Request, res: Response) => {
    upload.single("image")(req, res, async (err: any) => {
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
      try {
        const imageUrl = await uploadToS3(req.file.buffer, req.file.mimetype, req.file.originalname);
        res.json({ imageUrl });
      } catch {
        res.status(500).json({ message: "Upload to storage failed" });
      }
    });
  });

  app.delete("/api/admin/upload", requireAdmin, async (req: Request, res: Response) => {
    const { imageUrl } = req.body;
    if (imageUrl && typeof imageUrl === "string") {
      await deleteFromS3(imageUrl).catch(() => {});
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

  app.post("/api/admin/login", loginLimiter, async (req, res) => {
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
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session save failed" });
      res.json({ email: admin.email });
    });
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

  app.post("/api/orders", async (req, res) => {
    const parsed = createOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid order data", errors: parsed.error.flatten() });
    }

    const { deviceId, items: requestItems } = parsed.data;

    const menuItemIds = requestItems.map((i) => i.menuItemId);
    const allMenuItems = await storage.getMenuItems();
    const menuMap = new Map(allMenuItems.filter((m) => m.visible).map((m) => [m.id, m]));

    const missingIds = menuItemIds.filter((id) => !menuMap.has(id));
    if (missingIds.length > 0) {
      return res.status(400).json({ message: `Items not available: ${missingIds.join(", ")}` });
    }

    let total = 0;
    const orderItemsData = requestItems.map((ri) => {
      const menuItem = menuMap.get(ri.menuItemId)!;
      const itemPrice = parseFloat(menuItem.price);
      total += itemPrice * ri.quantity;
      return {
        menuItemId: ri.menuItemId,
        nameEn: menuItem.nameEn,
        nameEs: menuItem.nameEs,
        price: menuItem.price,
        quantity: ri.quantity,
      };
    });

    try {
      const order = await storage.createOrder(total.toFixed(2), deviceId, orderItemsData);
      res.status(201).json({ orderNumber: order.orderNumber, orderId: order.id, total: order.total });
    } catch (err) {
      console.error("Order creation failed:", err);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    const orderList = await storage.getOrders();
    res.json(orderList);
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });

    const statusParsed = orderStatusEnum.safeParse(req.body.status);
    if (!statusParsed.success) {
      return res.status(400).json({ message: "Invalid status. Must be: pending, preparing, or completed" });
    }

    const order = await storage.updateOrderStatus(id, statusParsed.data);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  return httpServer;
}
