import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  adminUsers,
  menuCategories,
  menuItems,
  promotions,
  siteContent,
  type AdminUser,
  type InsertAdminUser,
  type MenuCategory,
  type InsertMenuCategory,
  type MenuItem,
  type InsertMenuItem,
  type Promotion,
  type InsertPromotion,
  type SiteContent,
  type InsertSiteContent,
} from "@shared/schema";

export interface IStorage {
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(data: InsertAdminUser): Promise<AdminUser>;

  getCategories(): Promise<MenuCategory[]>;
  getCategoryById(id: number): Promise<MenuCategory | undefined>;
  createCategory(data: InsertMenuCategory): Promise<MenuCategory>;
  updateCategory(id: number, data: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined>;
  deleteCategory(id: number): Promise<void>;

  getMenuItems(): Promise<MenuItem[]>;
  getFeaturedItems(): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  createMenuItem(data: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<void>;

  getPromotions(): Promise<Promotion[]>;
  getActivePromotions(): Promise<Promotion[]>;
  getPromotionById(id: number): Promise<Promotion | undefined>;
  createPromotion(data: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, data: Partial<InsertPromotion>): Promise<Promotion | undefined>;
  deletePromotion(id: number): Promise<void>;

  getSiteContent(): Promise<SiteContent[]>;
  upsertSiteContent(data: InsertSiteContent): Promise<SiteContent>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async createAdmin(data: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(data).returning();
    return user;
  }

  async getCategories(): Promise<MenuCategory[]> {
    return db.select().from(menuCategories).orderBy(menuCategories.sortOrder);
  }

  async getCategoryById(id: number): Promise<MenuCategory | undefined> {
    const [cat] = await db.select().from(menuCategories).where(eq(menuCategories.id, id));
    return cat;
  }

  async createCategory(data: InsertMenuCategory): Promise<MenuCategory> {
    const [cat] = await db.insert(menuCategories).values(data).returning();
    return cat;
  }

  async updateCategory(id: number, data: Partial<InsertMenuCategory>): Promise<MenuCategory | undefined> {
    const [cat] = await db.update(menuCategories).set(data).where(eq(menuCategories.id, id)).returning();
    return cat;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.categoryId, id));
    await db.delete(menuCategories).where(eq(menuCategories.id, id));
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return db.select().from(menuItems);
  }

  async getFeaturedItems(): Promise<MenuItem[]> {
    return db.select().from(menuItems).where(eq(menuItems.featured, true));
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(data: InsertMenuItem): Promise<MenuItem> {
    const [item] = await db.insert(menuItems).values(data).returning();
    return item;
  }

  async updateMenuItem(id: number, data: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const [item] = await db.update(menuItems).set(data).where(eq(menuItems.id, id)).returning();
    return item;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  async getPromotions(): Promise<Promotion[]> {
    return db.select().from(promotions);
  }

  async getActivePromotions(): Promise<Promotion[]> {
    return db.select().from(promotions).where(eq(promotions.active, true));
  }

  async getPromotionById(id: number): Promise<Promotion | undefined> {
    const [promo] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promo;
  }

  async createPromotion(data: InsertPromotion): Promise<Promotion> {
    const [promo] = await db.insert(promotions).values(data).returning();
    return promo;
  }

  async updatePromotion(id: number, data: Partial<InsertPromotion>): Promise<Promotion | undefined> {
    const [promo] = await db.update(promotions).set(data).where(eq(promotions.id, id)).returning();
    return promo;
  }

  async deletePromotion(id: number): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getSiteContent(): Promise<SiteContent[]> {
    return db.select().from(siteContent);
  }

  async upsertSiteContent(data: InsertSiteContent): Promise<SiteContent> {
    const [result] = await db
      .insert(siteContent)
      .values(data)
      .onConflictDoUpdate({
        target: siteContent.key,
        set: { valueEn: data.valueEn, valueEs: data.valueEs },
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
