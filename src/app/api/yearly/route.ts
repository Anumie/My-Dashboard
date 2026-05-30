export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { yearlyReflections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");

  if (!year) {
    return NextResponse.json({ error: "year required" }, { status: 400 });
  }

  const [data] = await db
    .select()
    .from(yearlyReflections)
    .where(eq(yearlyReflections.year, parseInt(year)));

  return NextResponse.json(data ?? null);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { year, vision, nonNegotiables, focusWord, whatToChange, yearBuckets } = body;

  if (!year) {
    return NextResponse.json({ error: "year required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(yearlyReflections)
    .where(eq(yearlyReflections.year, year));

  const values = {
    vision: vision ?? null,
    nonNegotiables: nonNegotiables ?? null,
    focusWord: focusWord ?? null,
    whatToChange: whatToChange ?? null,
    yearBuckets: yearBuckets ?? [],
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db
      .update(yearlyReflections)
      .set(values)
      .where(eq(yearlyReflections.year, year))
      .returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db
      .insert(yearlyReflections)
      .values({ year, ...values })
      .returning();
    return NextResponse.json(created);
  }
}
