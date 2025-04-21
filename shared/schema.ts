import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define mood as enum type
export const moodEnum = z.enum(['calm', 'happy', 'neutral', 'sad', 'angry']);
export type Mood = z.infer<typeof moodEnum>;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// User validation schema with extended validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  mood: varchar("mood", { length: 50 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  mood: true,
  date: true,
});

// Define relations after all tables are declared
export const usersRelations = relations(users, ({ many }) => ({
  journalEntries: many(journalEntries),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one }) => ({
  user: one(users, {
    fields: [journalEntries.userId],
    references: [users.id],
  }),
}));

// Extend the schema with validation
export const journalEntryValidationSchema = insertJournalEntrySchema.extend({
  mood: moodEnum,
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  content: z.string().min(1, "Journal content is required"),
  date: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string');
      }
      return date;
    }
    return val;
  }),
});

// Types for TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryWithValidation = z.infer<typeof journalEntryValidationSchema>;
