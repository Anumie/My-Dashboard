export const dynamic = "force-dynamic";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const publicOnly = searchParams.get("public") === "true";

  let whereClause = undefined;
  if (type) whereClause = eq(projects.type, type);
  if (publicOnly) whereClause = eq(projects.status, "published");

  const result = await db
    .select()
    .from(projects)
    .where(whereClause)
    .orderBy(projects.createdAt);

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, type, tags, status, link, imageUrl, publishedAt, featured } = body;

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const [project] = await db
    .insert(projects)
    .values({
      title,
      description: description ?? null,
      type: type ?? "project",
      tags: tags ?? [],
      status: status ?? "idea",
      link: link ?? null,
      imageUrl: imageUrl ?? null,
      publishedAt: publishedAt ?? null,
      featured: featured ?? false,
    })
    .returning();

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const [project] = await db
    .update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await db.delete(projects).where(eq(projects.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
