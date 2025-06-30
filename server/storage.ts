import { locations, items, achievements, type Location, type Item, type Achievement, type InsertLocation, type InsertItem, type InsertAchievement } from "@shared/schema";

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

  // Analytics
  getStats(): Promise<{
    totalItems: number;
    totalValue: number;
    locationsCount: number;
    recentItems: Item[];
  }>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private items: Map<number, Item>;
  private achievements: Map<number, Achievement>;
  private currentLocationId: number;
  private currentItemId: number;
  private currentAchievementId: number;

  constructor() {
    this.locations = new Map();
    this.items = new Map();
    this.achievements = new Map();
    this.currentLocationId = 1;
    this.currentItemId = 1;
    this.currentAchievementId = 1;
    
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Create default locations
    const home = this.createLocationSync({ name: "My Home", path: "My Home", parentId: null });
    const livingRoom = this.createLocationSync({ name: "Living Room", path: "My Home/Living Room", parentId: home.id });
    const bedroom = this.createLocationSync({ name: "Bedroom", path: "My Home/Bedroom", parentId: home.id });
    const kitchen = this.createLocationSync({ name: "Kitchen", path: "My Home/Kitchen", parentId: home.id });
    const office = this.createLocationSync({ name: "Home Office", path: "My Home/Home Office", parentId: home.id });

    // Create default achievements
    this.createAchievementSync({
      name: "First Steps",
      description: "Add your first item",
      icon: "star",
      threshold: 1,
      type: "items_count",
      isUnlocked: false,
      unlockedAt: null
    });

    this.createAchievementSync({
      name: "Getting Started",
      description: "Add 10 items to your inventory",
      icon: "trophy",
      threshold: 10,
      type: "items_count",
      isUnlocked: false,
      unlockedAt: null
    });

    this.createAchievementSync({
      name: "Collector",
      description: "Add 250 items to your inventory",
      icon: "crown",
      threshold: 250,
      type: "items_count",
      isUnlocked: false,
      unlockedAt: null
    });

    this.createAchievementSync({
      name: "High Value",
      description: "Reach $10,000 in total inventory value",
      icon: "diamond",
      threshold: 10000,
      type: "total_value",
      isUnlocked: false,
      unlockedAt: null
    });
  }

  private createLocationSync(location: InsertLocation): Location {
    const id = this.currentLocationId++;
    const newLocation: Location = {
      ...location,
      id,
      createdAt: new Date(),
    };
    this.locations.set(id, newLocation);
    return newLocation;
  }

  private createAchievementSync(achievement: InsertAchievement): Achievement {
    const id = this.currentAchievementId++;
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    return this.createLocationSync(location);
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const existing = this.locations.get(id);
    if (!existing) return undefined;
    
    const updated: Location = { ...existing, ...location };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Items
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getItem(id: number): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async getItemsByLocation(locationId: number): Promise<Item[]> {
    return Array.from(this.items.values()).filter(item => item.locationId === locationId);
  }

  async searchItems(query: string): Promise<Item[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.items.values()).filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.barcode?.includes(searchTerm)
    );
  }

  async createItem(item: InsertItem): Promise<Item> {
    const id = this.currentItemId++;
    const now = new Date();
    const newItem: Item = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(id, newItem);
    
    // Check for achievement unlocks
    await this.checkAchievements();
    
    return newItem;
  }

  async updateItem(id: number, item: Partial<InsertItem>): Promise<Item | undefined> {
    const existing = this.items.get(id);
    if (!existing) return undefined;
    
    const updated: Item = { ...existing, ...item, updatedAt: new Date() };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.items.delete(id);
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    return this.createAchievementSync(achievement);
  }

  async updateAchievement(id: number, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const existing = this.achievements.get(id);
    if (!existing) return undefined;
    
    const updated: Achievement = { ...existing, ...achievement };
    this.achievements.set(id, updated);
    return updated;
  }

  async unlockAchievement(id: number): Promise<Achievement | undefined> {
    const achievement = this.achievements.get(id);
    if (!achievement) return undefined;
    
    const updated: Achievement = {
      ...achievement,
      isUnlocked: true,
      unlockedAt: new Date(),
    };
    this.achievements.set(id, updated);
    return updated;
  }

  // Analytics
  async getStats(): Promise<{
    totalItems: number;
    totalValue: number;
    locationsCount: number;
    recentItems: Item[];
  }> {
    const allItems = Array.from(this.items.values());
    const totalValue = allItems.reduce((sum, item) => {
      return sum + (parseFloat(item.value || '0') || 0);
    }, 0);

    const recentItems = allItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalItems: allItems.length,
      totalValue,
      locationsCount: this.locations.size,
      recentItems,
    };
  }

  private async checkAchievements(): Promise<void> {
    const stats = await this.getStats();
    const achievements = Array.from(this.achievements.values());

    for (const achievement of achievements) {
      if (achievement.isUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.type) {
        case 'items_count':
          shouldUnlock = stats.totalItems >= achievement.threshold;
          break;
        case 'total_value':
          shouldUnlock = stats.totalValue >= achievement.threshold;
          break;
        case 'locations_count':
          shouldUnlock = stats.locationsCount >= achievement.threshold;
          break;
      }

      if (shouldUnlock) {
        await this.unlockAchievement(achievement.id);
      }
    }
  }
}

export const storage = new MemStorage();
