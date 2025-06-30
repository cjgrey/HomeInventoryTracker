import type { Item, Location, Achievement } from "@shared/schema";

export interface OfflineDB {
  items: Item[];
  locations: Location[];
  achievements: Achievement[];
  lastSync: Date | null;
}

const DB_KEY = "vault-offline-db";
const SYNC_KEY = "vault-last-sync";

export function saveToOfflineDB(data: Partial<OfflineDB>) {
  try {
    const existing = getOfflineDB();
    const updated = { ...existing, ...data };
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    localStorage.setItem(SYNC_KEY, new Date().toISOString());
  } catch (error) {
    console.error("Failed to save to offline DB:", error);
  }
}

export function getOfflineDB(): OfflineDB {
  try {
    const data = localStorage.getItem(DB_KEY);
    const lastSync = localStorage.getItem(SYNC_KEY);
    
    return data ? {
      ...JSON.parse(data),
      lastSync: lastSync ? new Date(lastSync) : null
    } : {
      items: [],
      locations: [],
      achievements: [],
      lastSync: null
    };
  } catch (error) {
    console.error("Failed to load offline DB:", error);
    return {
      items: [],
      locations: [],
      achievements: [],
      lastSync: null
    };
  }
}

export function clearOfflineDB() {
  try {
    localStorage.removeItem(DB_KEY);
    localStorage.removeItem(SYNC_KEY);
  } catch (error) {
    console.error("Failed to clear offline DB:", error);
  }
}

export function getLastSyncTime(): Date | null {
  try {
    const lastSync = localStorage.getItem(SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  } catch (error) {
    console.error("Failed to get last sync time:", error);
    return null;
  }
}

// Utility to check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Utility to sync with server when back online
export async function syncWithServer() {
  if (!isOnline()) {
    throw new Error("Cannot sync while offline");
  }

  try {
    // This would implement actual sync logic
    // For now, we'll just update the sync time
    localStorage.setItem(SYNC_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}
