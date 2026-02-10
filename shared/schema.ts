import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({ id: true });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).omit({ id: true });
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;
export type MenuCategory = typeof menuCategories.$inferSelect;

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionEs: text("description_es").notNull(),
  price: text("price").notNull(),
  featured: boolean("featured").notNull().default(false),
  visible: boolean("visible").notNull().default(true),
  imageUrl: text("image_url"),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleEs: text("title_es").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionEs: text("description_es").notNull(),
  active: boolean("active").notNull().default(true),
  startDate: text("start_date"),
  endDate: text("end_date"),
  imageUrl: text("image_url"),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({ id: true });
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  valueEn: text("value_en").notNull(),
  valueEs: text("value_es").notNull(),
});

export const insertSiteContentSchema = createInsertSchema(siteContent).omit({ id: true });
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

export type User = typeof adminUsers.$inferSelect;
export type InsertUser = InsertAdminUser;
