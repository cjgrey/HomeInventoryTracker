import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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

export const shareableLists = pgTable("shareable_lists", {
  id: serial("id").primaryKey(),
  shareId: text("share_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  locationId: integer("location_id").references(() => locations.id),
  isPublic: boolean("is_public").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shareableListItems = pgTable("shareable_list_items", {
  id: serial("id").primaryKey(),
  listId: integer("list_id").references(() => shareableLists.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
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

export const insertShareableListSchema = createInsertSchema(shareableLists).omit({
  id: true,
  shareId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShareableListItemSchema = createInsertSchema(shareableListItems).omit({
  id: true,
  addedAt: true,
});

// Relations
export const locationsRelations = relations(locations, ({ many, one }) => ({
  items: many(items),
  shareableLists: many(shareableLists),
  parent: one(locations, { fields: [locations.parentId], references: [locations.id] }),
  children: many(locations),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  location: one(locations, { fields: [items.locationId], references: [locations.id] }),
  shareableListItems: many(shareableListItems),
}));

export const shareableListsRelations = relations(shareableLists, ({ one, many }) => ({
  location: one(locations, { fields: [shareableLists.locationId], references: [locations.id] }),
  items: many(shareableListItems),
}));

export const shareableListItemsRelations = relations(shareableListItems, ({ one }) => ({
  list: one(shareableLists, { fields: [shareableListItems.listId], references: [shareableLists.id] }),
  item: one(items, { fields: [shareableListItems.itemId], references: [items.id] }),
}));

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertShareableList = z.infer<typeof insertShareableListSchema>;
export type InsertShareableListItem = z.infer<typeof insertShareableListItemSchema>;

export type Location = typeof locations.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type ShareableList = typeof shareableLists.$inferSelect;
export type ShareableListItem = typeof shareableListItems.$inferSelect;
