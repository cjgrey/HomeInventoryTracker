import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => locations.id),
  path: text("path").notNull(), // hierarchical path like "Home/Living Room/Entertainment Center"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  barcode: text("barcode"),
  value: decimal("value", { precision: 10, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  warrantyEndDate: timestamp("warranty_end_date"),
  locationId: integer("location_id").references(() => locations.id),
  photos: text("photos").array().default([]), // array of photo URLs
  receipts: text("receipts").array().default([]), // array of receipt URLs
  notes: text("notes"),
  customFields: jsonb("custom_fields").default({}), // flexible custom fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  threshold: integer("threshold").notNull(),
  type: text("type").notNull(), // "items_count", "total_value", "locations_count", etc.
  unlockedAt: timestamp("unlocked_at"),
  isUnlocked: boolean("is_unlocked").default(false),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type Location = typeof locations.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
