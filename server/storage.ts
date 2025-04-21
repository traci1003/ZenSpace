import { 
  users, journalEntries, 
  type User, type InsertUser, 
  type JournalEntry, type InsertJournalEntry
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, between } from "drizzle-orm";

// Interface for storage operations
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getUserJournalEntries(userId: number): Promise<JournalEntry[]>;
  getUserJournalEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  constructor() {
    // Create PostgreSQL session store
    const PgSessionStore = connectPgSimple(session);
    this.sessionStore = new PgSessionStore({
      pool, // Use the PostgreSQL pool directly
      tableName: 'session',
      createTableIfMissing: true,
    });
  }
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Journal operations
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const entryToInsert = {
      ...insertEntry,
      date: insertEntry.date || new Date()
    };
    
    const result = await db.insert(journalEntries).values(entryToInsert).returning();
    return result[0];
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const result = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
    return result[0];
  }

  async getUserJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.date));
  }

  async getUserJournalEntriesByDateRange(userId: number, startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          between(journalEntries.date, startDate, endDate)
        )
      )
      .orderBy(desc(journalEntries.date));
  }

  async updateJournalEntry(id: number, partialEntry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const result = await db
      .update(journalEntries)
      .set(partialEntry)
      .where(eq(journalEntries.id, id))
      .returning();
    
    return result[0];
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(journalEntries)
      .where(eq(journalEntries.id, id))
      .returning();
    
    return result.length > 0;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();
