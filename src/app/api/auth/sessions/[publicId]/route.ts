import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function DELETE(_: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const context = await getCurrentSession();
  if (!context) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Debe iniciar sesión." } }, { status: 401 });
  const { publicId } = await params;
  const result = await prisma.session.updateMany({ where: { publicId, userId: context.userId, revokedAt: null }, data: { revokedAt: new Date() } });
  if (!result.count) return NextResponse.json({ error: { code: "NOT_FOUND", message: "La sesión no existe." } }, { status: 404 });
  await prisma.auditEvent.create({ data: { tenantId: context.tenantId, actorUserId: context.userId, action: "SESSION_REVOKED", module: "identity", entityType: "session", entityId: publicId } });
  return NextResponse.json({ success: true });
}
