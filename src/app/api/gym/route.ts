export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { gymSessions } from "@/lib/db/schema";
import { eq, gte, lte, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && to) {
    const result = await db.select().from(gymSessions).where(and(gte(gymSessions.sessionDate, from), lte(gymSessions.sessionDate, to)));
    return NextResponse.json(result);
  }
  const result = await db.select().from(gymSessions).orderBy(gymSessions.sessionDate);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { sessionDate, type, notes } = body;
  if (!sessionDate) return NextResponse.json({ error: "sessionDate required" }, { status: 400 });
  const [session] = await db.insert(gymSessions).values({ sessionDate, type: type ?? null, notes: notes ?? null }).returning();
  return NextResponse.json(session);
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(gymSessions).where(eq(gymSessions.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
