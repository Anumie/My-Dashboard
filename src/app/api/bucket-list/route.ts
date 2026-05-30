export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bucketListItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select()
    .from(bucketListItems)
    .orderBy(bucketListItems.category, bucketListItems.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, category, notes, priority } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "title and category required" }, { status: 400 });
  }

  const [item] = await db
    .insert(bucketListItems)
    .values({
      title,
      category,
      notes: notes ?? null,
      priority: priority ?? "medium",
    })
    .returning();

  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [item] = await db
    .update(bucketListItems)
    .set(updates)
    .where(eq(bucketListItems.id, id))
    .returning();

  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(bucketListItems).where(eq(bucketListItems.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
