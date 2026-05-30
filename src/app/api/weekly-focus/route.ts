export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weeklyFocus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get("weekStart");

  if (!weekStart) {
    return NextResponse.json({ error: "weekStart required" }, { status: 400 });
  }

  const [focus] = await db
    .select()
    .from(weeklyFocus)
    .where(eq(weeklyFocus.weekStart, weekStart));

  return NextResponse.json(focus ?? null);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const {
    weekStart,
    theme,
    goals,
    reflections,
    currentlyReading,
    currentlyReadingAuthor,
    currentlyReadingCover,
  } = body;

  if (!weekStart) {
    return NextResponse.json({ error: "weekStart required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(weeklyFocus)
    .where(eq(weeklyFocus.weekStart, weekStart));

  if (existing) {
    const [updated] = await db
      .update(weeklyFocus)
      .set({
        theme,
        goals: goals ?? [],
        reflections,
        currentlyReading,
        currentlyReadingAuthor,
        currentlyReadingCover,
        updatedAt: new Date(),
      })
      .where(eq(weeklyFocus.weekStart, weekStart))
      .returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db
      .insert(weeklyFocus)
      .values({
        weekStart,
        theme: theme ?? null,
        goals: goals ?? [],
        reflections: reflections ?? null,
        currentlyReading: currentlyReading ?? null,
        currentlyReadingAuthor: currentlyReadingAuthor ?? null,
        currentlyReadingCover: currentlyReadingCover ?? null,
      })
      .returning();
    return NextResponse.json(created);
  }
}
