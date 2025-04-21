import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { journalEntryValidationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth, ensureAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  setupAuth(app);
  
  const apiRouter = express.Router();
  
  // Journal Entries API
  
  // Get all journal entries for a user
  apiRouter.get("/journal-entries", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from authenticated session
      const userId = req.user!.id;
      const entries = await storage.getUserJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });
  
  // Get a specific journal entry
  apiRouter.get("/journal-entries/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id, 10);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Verify that the entry belongs to the logged-in user
      if (entry.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to this journal entry" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });
  
  // Create a new journal entry
  apiRouter.post("/journal-entries", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get user ID from authenticated session
      const userId = req.user!.id;
      const data = { ...req.body, userId };
      
      // Validate request body
      const validationResult = journalEntryValidationSchema.safeParse(data);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        console.log("Journal validation error:", errorMessage);
        console.log("Journal data received:", JSON.stringify(data, null, 2));
        return res.status(400).json({ message: errorMessage });
      }
      
      const newEntry = await storage.createJournalEntry(validationResult.data);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });
  
  // Update a journal entry
  apiRouter.put("/journal-entries/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id, 10);
      const existingEntry = await storage.getJournalEntry(entryId);
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Verify that the entry belongs to the logged-in user
      if (existingEntry.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized to update this journal entry" });
      }
      
      // Validate request body
      const validationResult = journalEntryValidationSchema.partial().safeParse(req.body);
      
      if (!validationResult.success) {
        const errorMessage = fromZodError(validationResult.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedEntry = await storage.updateJournalEntry(entryId, validationResult.data);
      res.json(updatedEntry);
    } catch (error) {
      console.error("Error updating journal entry:", error);
      res.status(500).json({ message: "Failed to update journal entry" });
    }
  });
  
  // Delete a journal entry
  apiRouter.delete("/journal-entries/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const entryId = parseInt(req.params.id, 10);
      const existingEntry = await storage.getJournalEntry(entryId);
      
      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      // Verify that the entry belongs to the logged-in user
      if (existingEntry.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized to delete this journal entry" });
      }
      
      const success = await storage.deleteJournalEntry(entryId);
      
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });
  
  // Get journal entries by date range
  apiRouter.get("/journal-entries/range/:start/:end", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const entries = await storage.getUserJournalEntriesByDateRange(userId, startDate, endDate);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries by date range:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  // Mount API routes under /api prefix
  app.use("/api", apiRouter);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
