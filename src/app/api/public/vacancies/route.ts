import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function GET() {
  const vacancies = await prisma.vacancy.findMany({ where: { public: true, status: "PUBLISHED", deletedAt: null }, orderBy: { createdAt: "desc" }, select: { publicId: true, slug: true, title: true, summary: true, location: true, workMode: true, createdAt: true } });
  return NextResponse.json({ vacancies });
}
