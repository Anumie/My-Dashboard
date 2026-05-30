import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  real,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

// ─── TASKS ────────────────────────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  weekStart: date("week_start").notNull(), // ISO date of Monday
  dayOfWeek: integer("day_of_week"), // 0=Mon, 6=Sun; null = any day
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── GYM SESSIONS ─────────────────────────────────────────────────────────────
export const gymSessions = pgTable("gym_sessions", {
  id: serial("id").primaryKey(),
  sessionDate: date("session_date").notNull(),
  type: text("type"), // e.g. "Upper", "Lower", "Cardio"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── WEEKLY FOCUS & REFLECTIONS ──────────────────────────────────────────────
export const weeklyFocus = pgTable("weekly_focus", {
  id: serial("id").primaryKey(),
  weekStart: date("week_start").notNull().unique(),
  theme: text("theme"),
  goals: text("goals").array().default([]),
  reflections: text("reflections"),
  currentlyReading: text("currently_reading"),
  currentlyReadingAuthor: text("currently_reading_author"),
  currentlyReadingCover: text("currently_reading_cover"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── HABITS ──────────────────────────────────────────────────────────────────
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("⭐"),
  color: text("color").notNull().default("#7da07a"),
  goal: integer("goal").notNull().default(7), // days per week
  section: text("section").notNull().default("daily"), // "daily" | "devotional"
  active: boolean("active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  completedDate: date("completed_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── BOOKS ───────────────────────────────────────────────────────────────────
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  openLibraryKey: text("open_library_key"),
  title: text("title").notNull(),
  author: text("author"),
  coverUrl: text("cover_url"),
  status: text("status").notNull().default("want_to_read"), // "reading" | "read" | "want_to_read"
  startedAt: date("started_at"),
  finishedAt: date("finished_at"),
  quarter: integer("quarter"), // 1-4
  year: integer("year"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── BUCKET LIST ──────────────────────────────────────────────────────────────
export const bucketListItems = pgTable("bucket_list_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // Travel, Experience, Career, Personal, Health, Creative, Financial
  completed: boolean("completed").default(false).notNull(),
  completedDate: date("completed_date"),
  notes: text("notes"),
  priority: text("priority").default("medium"), // high | medium | low
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── QUARTERLY DATA ──────────────────────────────────────────────────────────
export const quarterlyData = pgTable("quarterly_data", {
  id: serial("id").primaryKey(),
  quarter: integer("quarter").notNull(), // 1-4
  year: integer("year").notNull(),
  // Finance
  creditCards: jsonb("credit_cards").default([]), // [{name, balance, limit}]
  savings: jsonb("savings").default([]), // [{name, balance, goal}]
  // Achievements
  achievements: text("achievements").array().default([]),
  // Parking lot ideas
  parkingLot: text("parking_lot").array().default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── GOALS ───────────────────────────────────────────────────────────────────
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // Finance, Health, Business, Personal
  scope: text("scope").notNull(), // "quarterly" | "yearly"
  quarter: integer("quarter"), // 1-4 if quarterly
  year: integer("year").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedDate: date("completed_date"),
  notes: text("notes"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── YEARLY REFLECTION ───────────────────────────────────────────────────────
export const yearlyReflections = pgTable("yearly_reflections", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  vision: text("vision"),
  nonNegotiables: text("non_negotiables"),
  focusWord: text("focus_word"),
  whatToChange: text("what_to_change"),
  yearBuckets: jsonb("year_buckets").default([]), // [{theme, items:[]}]
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── PORTFOLIO / CONTENT ─────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("project"), // "project" | "post"
  tags: text("tags").array().default([]),
  status: text("status").notNull().default("idea"), // "idea" | "draft" | "published"
  link: text("link"),
  imageUrl: text("image_url"),
  publishedAt: date("published_at"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
