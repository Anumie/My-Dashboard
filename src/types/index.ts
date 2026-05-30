// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  weekStart: string;
  dayOfWeek: number | null;
  category: string | null;
  createdAt: Date;
}

// ─── Gym ──────────────────────────────────────────────────────────────────────
export interface GymSession {
  id: number;
  sessionDate: string;
  type: string | null;
  notes: string | null;
  createdAt: Date;
}

// ─── Weekly Focus ─────────────────────────────────────────────────────────────
export interface WeeklyFocus {
  id: number;
  weekStart: string;
  theme: string | null;
  goals: string[];
  reflections: string | null;
  currentlyReading: string | null;
  currentlyReadingAuthor: string | null;
  currentlyReadingCover: string | null;
  updatedAt: Date;
}

// ─── Habit ────────────────────────────────────────────────────────────────────
export interface Habit {
  id: number;
  name: string;
  icon: string;
  color: string;
  goal: number;
  section: string;
  active: boolean;
  sortOrder: number | null;
  createdAt: Date;
}

export interface HabitCompletion {
  id: number;
  habitId: number;
  completedDate: string;
  createdAt: Date;
}

export interface HabitWithCompletions extends Habit {
  completions: string[]; // array of date strings "yyyy-MM-dd"
}

// ─── Book ─────────────────────────────────────────────────────────────────────
export type BookStatus = "reading" | "read" | "want_to_read";

export interface Book {
  id: number;
  openLibraryKey: string | null;
  title: string;
  author: string | null;
  coverUrl: string | null;
  status: BookStatus;
  startedAt: string | null;
  finishedAt: string | null;
  quarter: number | null;
  year: number | null;
  notes: string | null;
  createdAt: Date;
}

// ─── Bucket List ──────────────────────────────────────────────────────────────
export type BucketCategory =
  | "Travel"
  | "Experience"
  | "Career"
  | "Personal"
  | "Health"
  | "Creative"
  | "Financial";

export type Priority = "high" | "medium" | "low";

export interface BucketListItem {
  id: number;
  title: string;
  category: BucketCategory;
  completed: boolean;
  completedDate: string | null;
  notes: string | null;
  priority: Priority;
  createdAt: Date;
}

// ─── Finance ─────────────────────────────────────────────────────────────────
export interface CreditCard {
  name: string;
  balance: number;
  limit: number;
}

export interface SavingsAccount {
  name: string;
  balance: number;
  goal: number;
}

// ─── Quarter ─────────────────────────────────────────────────────────────────
export interface QuarterlyData {
  id: number;
  quarter: number;
  year: number;
  creditCards: CreditCard[];
  savings: SavingsAccount[];
  achievements: string[];
  parkingLot: string[];
  updatedAt: Date;
}

// ─── Goals ───────────────────────────────────────────────────────────────────
export type GoalCategory = "Finance" | "Health" | "Business" | "Personal";
export type GoalScope = "quarterly" | "yearly";

export interface Goal {
  id: number;
  title: string;
  category: GoalCategory;
  scope: GoalScope;
  quarter: number | null;
  year: number;
  completed: boolean;
  completedDate: string | null;
  notes: string | null;
  sortOrder: number | null;
  createdAt: Date;
}

// ─── Yearly Reflection ───────────────────────────────────────────────────────
export interface YearBucket {
  theme: string;
  items: string[];
}

export interface YearlyReflection {
  id: number;
  year: number;
  vision: string | null;
  nonNegotiables: string | null;
  focusWord: string | null;
  whatToChange: string | null;
  yearBuckets: YearBucket[];
  updatedAt: Date;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
export type ProjectType = "project" | "post";
export type ProjectStatus = "idea" | "draft" | "published";

export interface Project {
  id: number;
  title: string;
  description: string | null;
  type: ProjectType;
  tags: string[];
  status: ProjectStatus;
  link: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Open Library ────────────────────────────────────────────────────────────
export interface OpenLibraryResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
}
