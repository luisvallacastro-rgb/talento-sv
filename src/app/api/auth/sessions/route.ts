import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function GET() {
  const context = await getCurrentSession();
  if (!context) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Debe iniciar sesión." } }, { status: 401 });
  const sessions = await prisma.session.findMany({ where: { userId: context.userId, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" }, select: { publicId: true, userAgent: true, ipAddress: true, createdAt: true, lastSeenAt: true, expiresAt: true } });
  return NextResponse.json({ sessions: sessions.map((session) => ({ ...session, current: session.publicId === context.sessionPublicId })) });
}
