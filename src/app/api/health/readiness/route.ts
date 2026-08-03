import { NextResponse } from "next/server";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", database: "available" }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "not_ready", database: "unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
