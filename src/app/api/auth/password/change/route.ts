import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { hashPassword, verifyPassword } from "@/modules/identity/domain/password";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(12).max(200).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/) });
export async function POST(request: Request) {
  try {
    const context = await getCurrentSession();
    if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401);
    const input = schema.parse(await request.json());
    const user = await prisma.user.findUniqueOrThrow({ where: { id: context.userId } });
    if (!user.passwordHash || !await verifyPassword(input.currentPassword, user.passwordHash)) throw new ApplicationError("La contraseña actual no coincide.", "INVALID_PASSWORD", 400);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(input.newPassword), mustChangePassword: false } }),
      prisma.session.updateMany({ where: { userId: user.id, id: { not: context.sessionId }, revokedAt: null }, data: { revokedAt: new Date() } }),
      prisma.auditEvent.create({ data: { tenantId: context.tenantId, actorUserId: user.id, action: "PASSWORD_CHANGED", module: "identity" } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error, "No fue posible cambiar la contraseña."); }
}
