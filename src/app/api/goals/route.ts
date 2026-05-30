export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const quarter = searchParams.get("quarter");
  const year = searchParams.get("year");
  const conditions: any[] = [];
  if (scope) conditions.push(eq(goals.scope, scope));
  if (year) conditions.push(eq(goals.year, parseInt(year)));
  if (quarter) conditions.push(eq(goals.quarter, parseInt(quarter)));
  const result = await db.select().from(goals).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(goals.category, goals.sortOrder, goals.createdAt);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { title, category, scope, quarter, year, notes } = body;
  if (!title || !category || !scope || !year) return NextResponse.json({ error: "title, category, scope, year required" }, { status: 400 });
  const [goal] = await db.insert(goals).values({ title, category, scope, quarter: quarter ?? null, year, notes: notes ?? null }).returning();
  return NextResponse.json(goal);
}

export async function PATCH(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const [goal] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
  return NextResponse.json(goal);
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(goals).where(eq(goals.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
