import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekStart = searchParams.get("weekStart");

  if (!weekStart) {
    return NextResponse.json({ error: "weekStart required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.weekStart, weekStart))
    .orderBy(tasks.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, weekStart, dayOfWeek, category } = body;

  if (!title || !weekStart) {
    return NextResponse.json(
      { error: "title and weekStart required" },
      { status: 400 }
    );
  }

  const [task] = await db
    .insert(tasks)
    .values({ title, weekStart, dayOfWeek: dayOfWeek ?? null, category: category ?? "general" })
    .returning();

  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, completed, title } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const updateData: Partial<typeof tasks.$inferInsert> = {};
  if (completed !== undefined) updateData.completed = completed;
  if (title !== undefined) updateData.title = title;

  const [task] = await db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning();

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(tasks).where(eq(tasks.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
