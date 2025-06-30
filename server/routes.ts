import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, insertItemSchema, insertAchievementSchema } from "@shared/schema";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  // Locations API
  app.get('/api/locations', async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch locations' });
    }
  });

  app.get('/api/locations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch location' });
    }
  });

  app.post('/api/locations', async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ message: 'Invalid location data' });
    }
  });

  app.put('/api/locations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLocationSchema.partial().parse(req.body);
      const location = await storage.updateLocation(id, validatedData);
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
      res.json(location);
    } catch (error) {
      res.status(400).json({ message: 'Invalid location data' });
    }
  });

  app.delete('/api/locations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLocation(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Location not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete location' });
    }
  });

  // Items API
  app.get('/api/items', async (req, res) => {
    try {
      const { search, locationId } = req.query;
      let items;
      
      if (search) {
        items = await storage.searchItems(search as string);
      } else if (locationId) {
        items = await storage.getItemsByLocation(parseInt(locationId as string));
      } else {
        items = await storage.getItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch items' });
    }
  });

  app.get('/api/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getItem(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch item' });
    }
  });

  app.post('/api/items', async (req, res) => {
    try {
      const validatedData = insertItemSchema.parse(req.body);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: 'Invalid item data' });
    }
  });

  app.put('/api/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: 'Invalid item data' });
    }
  });

  app.delete('/api/items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Item not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete item' });
    }
  });

  // File upload for photos/receipts
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Achievements API
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch achievements' });
    }
  });

  app.post('/api/achievements/:id/unlock', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const achievement = await storage.unlockAchievement(id);
      if (!achievement) {
        return res.status(404).json({ message: 'Achievement not found' });
      }
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ message: 'Failed to unlock achievement' });
    }
  });

  // Stats API
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Export API
  app.get('/api/export/csv', async (req, res) => {
    try {
      const items = await storage.getItems();
      const locations = await storage.getLocations();
      const locationMap = new Map(locations.map(l => [l.id, l]));
      
      const csvHeader = 'Name,Description,Barcode,Value,Purchase Date,Warranty End Date,Location,Notes\n';
      const csvRows = items.map(item => {
        const location = item.locationId ? locationMap.get(item.locationId) : null;
        return [
          `"${item.name}"`,
          `"${item.description || ''}"`,
          `"${item.barcode || ''}"`,
          `"${item.value || ''}"`,
          `"${item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : ''}"`,
          `"${item.warrantyEndDate ? new Date(item.warrantyEndDate).toISOString().split('T')[0] : ''}"`,
          `"${location ? location.path : ''}"`,
          `"${item.notes || ''}"`
        ].join(',');
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory.csv"');
      res.send(csvHeader + csvRows);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export CSV' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
