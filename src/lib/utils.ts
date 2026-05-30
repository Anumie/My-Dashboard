import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  startOfWeek,
  endOfWeek,
  format,
  addWeeks,
  subWeeks,
  getQuarter,
  getYear,
} from "date-fns";

// ─── Class helper ──────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Week helpers ─────────────────────────────────────────────────────────────
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

export function formatWeekKey(date: Date): string {
  return format(getWeekStart(date), "yyyy-MM-dd");
}

export function formatDisplayDate(date: Date): string {
  return format(date, "MMM d");
}

export function formatFullDate(date: Date): string {
  return format(date, "MMMM d, yyyy");
}

export function navigateWeek(weekStart: Date, direction: "prev" | "next"): Date {
  return direction === "next"
    ? addWeeks(weekStart, 1)
    : subWeeks(weekStart, 1);
}

export function isCurrentWeek(weekStart: Date): boolean {
  return formatWeekKey(weekStart) === formatWeekKey(new Date());
}

// ─── Quarter helpers ──────────────────────────────────────────────────────────
export function getCurrentQuarter(): { quarter: number; year: number } {
  const now = new Date();
  return { quarter: getQuarter(now), year: getYear(now) };
}

export function getQuarterLabel(quarter: number, year: number): string {
  return `Q${quarter} ${year}`;
}

export function getQuarterMonths(quarter: number): string[] {
  const months = [
    ["January", "February", "March"],
    ["April", "May", "June"],
    ["July", "August", "September"],
    ["October", "November", "December"],
  ];
  return months[quarter - 1];
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return format(new Date(dateStr), "MMM d, yyyy");
}

export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

// ─── Progress helpers ─────────────────────────────────────────────────────────
export function calcProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}
