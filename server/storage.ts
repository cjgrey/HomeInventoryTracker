import { 
  locations, 
  items, 
  achievements, 
  shareableLists,
  shareableListItems,
  type Location, 
  type Item, 
  type Achievement,
  type ShareableList,
  type ShareableListItem,
  type InsertLocation, 
  type InsertItem, 
  type InsertAchievement,
  type InsertShareableList,
  type InsertShareableListItem
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  getItemsByLocation(locationId: number): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;
  unlockAchievement(id: number): Promise<Achievement | undefined>;

  // Shareable Lists
  getShareableLists(): Promise<ShareableList[]>;
  getShareableList(id: number): Promise<ShareableList | undefined>;
  getShareableListByShareId(shareId: string): Promise<ShareableList | undefined>;
  createShareableList(list: InsertShareableList): Promise<ShareableList>;
  updateShareableList(id: number, list: Partial<InsertShareableList>): Promise<ShareableList | undefined>;
  deleteShareableList(id: number): Promise<boolean>;
  
  // Shareable List Items
  getShareableListItems(listId: number): Promise<(ShareableListItem & { item: Item })[]>;
  addItemToShareableList(listItem: InsertShareableListItem): Promise<ShareableListItem>;
  removeItemFromShareableList(listId: number, itemId: number): Promise<boolean>;

  // Analytics
  getStats(): Promise<{
    totalItems: number;
    totalValue: number;
    locationsCount: number;
    recentItems: Item[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Locations
  async getLocations(): Promise<Location[]> {
  try {
    return await db.select().from(locations);
  } catch (error) {
    console.error("Error in getLocations:", error);
    throw error;  // keep throwing so your route handles it
  }
}

  async getLocation(id: number): Promise<Location | undefined> {
    const result = await db.select().from(locations).where(eq(locations.id, id));
    return result[0] || undefined;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const [updated] = await db.update(locations).set(location).where(eq(locations.id, id)).returning();
    return updated || undefined;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await db.delete(locations).where(eq(locations.id, id));
    return result.rowCount > 0;
  }

  // Items
  async getItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(desc(items.createdAt));
  }

  async getItem(id: number): Promise<Item | undefined> {
    const result = await db.select().from(items).where(eq(items.id, id));
    return result[0] || undefined;
  }

  async getItemsByLocation(locationId: number): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.locationId, locationId));
  }

  async searchItems(query: string): Promise<Item[]> {
    return await db.select().from(items).where(like(items.name, `%${query}%`));
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const [updated] = await db.update(items).set({
      ...item,
      updatedAt: new Date()
    }).where(eq(items.id, id)).returning();
    return updated || undefined;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return result.rowCount > 0;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const result = await db.select().from(achievements).where(eq(achievements.id, id));
    return result[0] || undefined;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }

  async updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const [updated] = await db.update(achievements).set(achievement).where(eq(achievements.id, id)).returning();
    return updated || undefined;
  }

  async unlockAchievement(id: number): Promise<Achievement | undefined> {
    const [updated] = await db.update(achievements)
      .set({ isUnlocked: true, unlockedAt: new Date() })
      .where(eq(achievements.id, id))
      .returning();
    return updated || undefined;
  }

  // Shareable Lists
  async getShareableLists(): Promise<ShareableList[]> {
    return await db.select().from(shareableLists).orderBy(desc(shareableLists.createdAt));
  }

  async getShareableList(id: number): Promise<ShareableList | undefined> {
    const result = await db.select().from(shareableLists).where(eq(shareableLists.id, id));
    return result[0] || undefined;
  }

  async getShareableListByShareId(shareId: string): Promise<ShareableList | undefined> {
    const result = await db.select().from(shareableLists).where(eq(shareableLists.shareId, shareId));
    return result[0] || undefined;
  }

  async createShareableList(list: InsertShareableList): Promise<ShareableList> {
    const shareId = nanoid(10); // Generate unique share ID
    const [newList] = await db.insert(shareableLists).values({
      ...list,
      shareId
    }).returning();
    return newList;
  }

  async updateShareableList(id: number, list: Partial<InsertShareableList>): Promise<ShareableList | undefined> {
    const [updated] = await db.update(shareableLists)
      .set({ ...list, updatedAt: new Date() })
      .where(eq(shareableLists.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteShareableList(id: number): Promise<boolean> {
    const result = await db.delete(shareableLists).where(eq(shareableLists.id, id));
    return result.rowCount > 0;
  }

  // Shareable List Items
  async getShareableListItems(listId: number): Promise<(ShareableListItem & { item: Item })[]> {
    const result = await db
      .select({
        id: shareableListItems.id,
        listId: shareableListItems.listId,
        itemId: shareableListItems.itemId,
        addedAt: shareableListItems.addedAt,
        item: items
      })
      .from(shareableListItems)
      .leftJoin(items, eq(shareableListItems.itemId, items.id))
      .where(eq(shareableListItems.listId, listId));
    
    return result.filter(r => r.item) as (ShareableListItem & { item: Item })[];
  }

  async addItemToShareableList(listItem: InsertShareableListItem): Promise<ShareableListItem> {
    const [newListItem] = await db.insert(shareableListItems).values(listItem).returning();
    return newListItem;
  }

  async removeItemFromShareableList(listId: number, itemId: number): Promise<boolean> {
    const result = await db.delete(shareableListItems)
      .where(and(
        eq(shareableListItems.listId, listId),
        eq(shareableListItems.itemId, itemId)
      ));
    return result.rowCount > 0;
  }

  // Analytics
  async getStats(): Promise<{
    totalItems: number;
    totalValue: number;
    locationsCount: number;
    recentItems: Item[];
  }> {
    const allItems = await db.select().from(items);
    const allLocations = await db.select().from(locations);
    const recentItems = await db.select().from(items)
      .orderBy(desc(items.createdAt))
      .limit(5);

    const totalValue = allItems.reduce((sum, item) => {
      return sum + (parseFloat(item.value?.toString() || '0') || 0);
    }, 0);

    return {
      totalItems: allItems.length,
      totalValue,
      locationsCount: allLocations.length,
      recentItems
    };
  }
}

export const storage = new DatabaseStorage();