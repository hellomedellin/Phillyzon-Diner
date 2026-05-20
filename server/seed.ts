import { storage } from "./storage";
import { db } from "./db";
import { adminUsers, menuCategories, menuItems, promotions } from "@shared/schema";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existingCats = await storage.getCategories();
  if (existingCats.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database...");

  const existingAdmin = await storage.getAdminByEmail("admin@phillyzon.com");
  if (!existingAdmin) {
    await storage.createAdmin({
      email: "admin@phillyzon.com",
      password: await bcrypt.hash("phillyzon2024", 10),
    });
  }

  const [cheesesteaks] = await db.insert(menuCategories).values({
    nameEn: "Philly Cheesesteaks",
    nameEs: "Philly Cheesesteaks",
    sortOrder: 1,
  }).returning();

  const [burgers] = await db.insert(menuCategories).values({
    nameEn: "Classic Burgers",
    nameEs: "Hamburguesas Clasicas",
    sortOrder: 2,
  }).returning();

  const [sides] = await db.insert(menuCategories).values({
    nameEn: "Sides & Extras",
    nameEs: "Acompanantes y Extras",
    sortOrder: 3,
  }).returning();

  const [drinks] = await db.insert(menuCategories).values({
    nameEn: "Beverages",
    nameEs: "Bebidas",
    sortOrder: 4,
  }).returning();

  await db.insert(menuItems).values([
    {
      categoryId: cheesesteaks.id,
      nameEn: "The Original Philly",
      nameEs: "El Philly Original",
      descriptionEn: "Thinly sliced ribeye steak, melted provolone, sauteed onions on a fresh hoagie roll.",
      descriptionEs: "Carne de res ribeye finamente rebanada, provolone derretido, cebollas salteadas en pan hoagie fresco.",
      price: "32000",
      featured: true,
      visible: true,
    },
    {
      categoryId: cheesesteaks.id,
      nameEn: "Cheesesteak Whiz",
      nameEs: "Cheesesteak Whiz",
      descriptionEn: "Chopped ribeye with Cheez Whiz, grilled peppers, and mushrooms. The Philly classic.",
      descriptionEs: "Ribeye picado con Cheez Whiz, pimientos asados y champinones. El clasico de Philadelphia.",
      price: "34000",
      featured: true,
      visible: true,
    },
    {
      categoryId: cheesesteaks.id,
      nameEn: "Chicken Philly",
      nameEs: "Philly de Pollo",
      descriptionEn: "Grilled chicken breast with American cheese, peppers, and onions on a hoagie roll.",
      descriptionEs: "Pechuga de pollo a la parrilla con queso americano, pimientos y cebollas en pan hoagie.",
      price: "28000",
      featured: false,
      visible: true,
    },
    {
      categoryId: burgers.id,
      nameEn: "Classic Smash Burger",
      nameEs: "Smash Burger Clasica",
      descriptionEn: "Double smashed patties, American cheese, pickles, special sauce on a toasted brioche bun.",
      descriptionEs: "Doble carne smash, queso americano, pepinillos, salsa especial en pan brioche tostado.",
      price: "26000",
      featured: true,
      visible: true,
    },
    {
      categoryId: burgers.id,
      nameEn: "Bacon BBQ Burger",
      nameEs: "Hamburguesa BBQ con Tocino",
      descriptionEn: "Angus beef patty, crispy bacon, cheddar cheese, BBQ sauce, crispy onion rings.",
      descriptionEs: "Carne de res Angus, tocino crocante, queso cheddar, salsa BBQ, aros de cebolla crocantes.",
      price: "30000",
      featured: false,
      visible: true,
    },
    {
      categoryId: burgers.id,
      nameEn: "Mushroom Swiss Burger",
      nameEs: "Hamburguesa de Champinones y Suizo",
      descriptionEn: "Beef patty topped with sauteed mushrooms, melted Swiss cheese, garlic aioli.",
      descriptionEs: "Carne de res con champinones salteados, queso suizo derretido, aioli de ajo.",
      price: "28000",
      featured: false,
      visible: true,
    },
    {
      categoryId: sides.id,
      nameEn: "Loaded Cheese Fries",
      nameEs: "Papas con Queso Cargadas",
      descriptionEn: "Crispy fries topped with melted cheese, bacon bits, and green onions.",
      descriptionEs: "Papas fritas crocantes con queso derretido, tocino y cebolla verde.",
      price: "14000",
      featured: false,
      visible: true,
    },
    {
      categoryId: sides.id,
      nameEn: "Onion Rings",
      nameEs: "Aros de Cebolla",
      descriptionEn: "Beer-battered onion rings served with our signature dipping sauce.",
      descriptionEs: "Aros de cebolla apanados servidos con nuestra salsa especial.",
      price: "12000",
      featured: false,
      visible: true,
    },
    {
      categoryId: drinks.id,
      nameEn: "Classic Milkshake",
      nameEs: "Malteada Clasica",
      descriptionEn: "Creamy milkshake in vanilla, chocolate, or strawberry. Made with real ice cream.",
      descriptionEs: "Malteada cremosa de vainilla, chocolate o fresa. Hecha con helado real.",
      price: "10000",
      featured: false,
      visible: true,
    },
    {
      categoryId: drinks.id,
      nameEn: "Fresh Lemonade",
      nameEs: "Limonada Natural",
      descriptionEn: "Freshly squeezed lemonade, perfectly sweet and refreshing.",
      descriptionEs: "Limonada recien exprimida, perfectamente dulce y refrescante.",
      price: "8000",
      featured: false,
      visible: true,
    },
  ]);

  await db.insert(promotions).values([
    {
      titleEn: "Grand Opening Special",
      titleEs: "Especial de Inauguracion",
      descriptionEn: "Get 20% off your entire order during our grand opening week! Use code PHILLY20 when ordering.",
      descriptionEs: "Obten 20% de descuento en todo tu pedido durante nuestra semana de inauguracion! Usa el codigo PHILLY20 al pedir.",
      active: false,
      startDate: "2026-02-01",
      endDate: "2026-03-31",
    },
    {
      titleEn: "2x1 Cheesesteaks Tuesday",
      titleEs: "2x1 en Cheesesteaks los Martes",
      descriptionEn: "Every Tuesday, buy one Philly Cheesesteak and get the second one free. Dine-in only.",
      descriptionEs: "Todos los martes, compra un Philly Cheesesteak y lleva el segundo gratis. Solo en restaurante.",
      active: true,
    },
    {
      titleEn: "Weekend Combo Deal",
      titleEs: "Combo de Fin de Semana",
      descriptionEn: "Burger + Fries + Drink for a special combo price every Friday, Saturday and Sunday.",
      descriptionEs: "Hamburguesa + Papas + Bebida a precio especial de combo todos los viernes, sabado y domingo.",
      active: true,
    },
  ]);

  console.log("Database seeded successfully!");
}
