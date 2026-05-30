export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quarterlyData } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const quarter = searchParams.get("quarter");
  const year = searchParams.get("year");

  if (!quarter || !year) {
    return NextResponse.json({ error: "quarter and year required" }, { status: 400 });
  }

  const [data] = await db
    .select()
    .from(quarterlyData)
    .where(
      and(
        eq(quarterlyData.quarter, parseInt(quarter)),
        eq(quarterlyData.year, parseInt(year))
      )
    );

  return NextResponse.json(data ?? null);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { quarter, year, creditCards, savings, achievements, parkingLot } = body;

  if (!quarter || !year) {
    return NextResponse.json({ error: "quarter and year required" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(quarterlyData)
    .where(
      and(
        eq(quarterlyData.quarter, quarter),
        eq(quarterlyData.year, year)
      )
    );

  const values = {
    creditCards: creditCards ?? [],
    savings: savings ?? [],
    achievements: achievements ?? [],
    parkingLot: parkingLot ?? [],
    updatedAt: new Date(),
  };

  if (existing) {
    const [updated] = await db
      .update(quarterlyData)
      .set(values)
      .where(eq(quarterlyData.id, existing.id))
      .returning();
    return NextResponse.json(updated);
  } else {
    const [created] = await db
      .insert(quarterlyData)
      .values({ quarter, year, ...values })
      .returning();
    return NextResponse.json(created);
  }
}
