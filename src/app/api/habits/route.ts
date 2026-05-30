export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits, habitCompletions } from "@/lib/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const allHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.active, true))
    .orderBy(habits.sortOrder, habits.createdAt);

  if (from && to) {
    const completions = await db
      .select()
      .from(habitCompletions)
      .where(
        and(
          gte(habitCompletions.completedDate, from),
          lte(habitCompletions.completedDate, to)
        )
      );

    const habitsWithCompletions = allHabits.map((habit) => ({
      ...habit,
      completions: completions
        .filter((c) => c.habitId === habit.id)
        .map((c) => c.completedDate),
    }));

    return NextResponse.json(habitsWithCompletions);
  }

  return NextResponse.json(allHabits);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, icon, color, goal, section } = body;

  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const [habit] = await db
    .insert(habits)
    .values({
      name,
      icon: icon ?? "⭐",
      color: color ?? "#7da07a",
      goal: goal ?? 7,
      section: section ?? "daily",
    })
    .returning();

  return NextResponse.json(habit);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [habit] = await db
    .update(habits)
    .set(updates)
    .where(eq(habits.id, id))
    .returning();

  return NextResponse.json(habit);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(habits).where(eq(habits.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
