export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const quarter = searchParams.get("quarter");
  const year = searchParams.get("year");

  let whereClause = undefined;

  if (status) {
    whereClause = eq(books.status, status);
  }

  const result = await db
    .select()
    .from(books)
    .where(whereClause)
    .orderBy(books.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { openLibraryKey, title, author, coverUrl, status, startedAt, finishedAt, quarter, year, notes } = body;

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const [book] = await db
    .insert(books)
    .values({
      openLibraryKey: openLibraryKey ?? null,
      title,
      author: author ?? null,
      coverUrl: coverUrl ?? null,
      status: status ?? "want_to_read",
      startedAt: startedAt ?? null,
      finishedAt: finishedAt ?? null,
      quarter: quarter ?? null,
      year: year ?? null,
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json(book);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [book] = await db
    .update(books)
    .set(updates)
    .where(eq(books.id, id))
    .returning();

  return NextResponse.json(book);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(books).where(eq(books.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
