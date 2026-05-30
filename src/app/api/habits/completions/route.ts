export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habitCompletions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// Toggle a habit completion for a given date
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { habitId, date } = body;

  if (!habitId || !date) {
    return NextResponse.json({ error: "habitId and date required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(habitCompletions)
    .where(
      and(
        eq(habitCompletions.habitId, habitId),
        eq(habitCompletions.completedDate, date)
      )
    );

  if (existing) {
    await db
      .delete(habitCompletions)
      .where(eq(habitCompletions.id, existing.id));
    return NextResponse.json({ completed: false });
  } else {
    await db
      .insert(habitCompletions)
      .values({ habitId, completedDate: date });
    return NextResponse.json({ completed: true });
  }
}
