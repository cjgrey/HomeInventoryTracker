import { db } from "./db";
import { locations, items, achievements } from "@shared/schema";

export async function initializeDefaultData() {
  try {
    // Check if data already exists
    const existingLocations = await db.select().from(locations).limit(1);
    if (existingLocations.length > 0) {
      return; // Data already exists
    }

    console.log("Initializing default data...");

    // Create default locations
    const [homeLocation] = await db.insert(locations).values({
      name: "My Home",
      path: "My Home",
      parentId: null,
      description: "Main house inventory",
    }).returning();

    const [kitchenLocation] = await db.insert(locations).values({
      name: "Kitchen",
      path: "My Home/Kitchen",
      parentId: homeLocation.id,
      description: "Kitchen appliances and food items",
    }).returning();

    const [fridgeLocation] = await db.insert(locations).values({
      name: "Refrigerator",
      path: "My Home/Kitchen/Refrigerator",
      parentId: kitchenLocation.id,
      description: "Food items in the fridge",
    }).returning();

    await db.insert(locations).values({
      name: "Living Room",
      path: "My Home/Living Room",
      parentId: homeLocation.id,
      description: "Entertainment and furniture",
    });

    await db.insert(locations).values({
      name: "Bedroom",
      path: "My Home/Bedroom",
      parentId: homeLocation.id,
      description: "Personal belongings and clothes",
    });

    // Create some sample items for testing shareable lists
    await db.insert(items).values([
      {
        name: "Leftover Pizza",
        description: "Homemade pizza with pepperoni and mushrooms",
        locationId: fridgeLocation.id,
        value: "12.00",
        notes: "Store in airtight container, best consumed within 3 days",
        warrantyEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        name: "Greek Yogurt",
        description: "Organic plain Greek yogurt, 32oz container",
        locationId: fridgeLocation.id,
        barcode: "1234567890123",
        value: "5.99",
        warrantyEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      },
      {
        name: "Meal Prep Containers",
        description: "Chicken teriyaki with rice and vegetables (4 containers)",
        locationId: fridgeLocation.id,
        value: "24.00",
        notes: "Prepared on Sunday, microwave for 2-3 minutes",
        warrantyEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
    ]);

    // Create default achievements
    await db.insert(achievements).values([
      {
        name: "First Steps",
        description: "Add your first item to the inventory",
        type: "items_count",
        icon: "trophy",
        threshold: 1,
        isUnlocked: false,
      },
      {
        name: "Getting Organized",
        description: "Add 10 items to your inventory",
        type: "items_count",
        icon: "star",
        threshold: 10,
        isUnlocked: false,
      },
      {
        name: "Collector",
        description: "Add 50 items to your inventory",
        type: "items_count",
        icon: "crown",
        threshold: 50,
        isUnlocked: false,
      },
      {
        name: "Valuable Collection",
        description: "Reach $1000 in total inventory value",
        type: "total_value",
        icon: "diamond",
        threshold: 1000,
        isUnlocked: false,
      },
      {
        name: "Home Mapper",
        description: "Create 5 different locations",
        type: "locations_count",
        icon: "map",
        threshold: 5,
        isUnlocked: false,
      },
    ]);

    console.log("Default data initialized successfully");
  } catch (error) {
    console.error("Error initializing default data:", error);
  }
}