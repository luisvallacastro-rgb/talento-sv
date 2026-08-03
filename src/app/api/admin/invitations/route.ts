import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { requirePermission } from "@/modules/authorization/domain/access-context";
import { createSessionToken } from "@/modules/identity/domain/session-token";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

const schema = z.object({ email: z.email(), roleCodes: z.array(z.string().min(1)).min(1).max(5) });
export async function POST(request: Request) {
  try {
    const context = await getCurrentSession(); if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401); requirePermission(context, "users.manage");
    const input = schema.parse(await request.json());
    const roles = await prisma.role.findMany({ where: { tenantId: context.tenantId, code: { in: input.roleCodes } }, select: { code: true } });
    if (roles.length !== new Set(input.roleCodes).size) throw new ApplicationError("Uno o más roles no son válidos.", "INVALID_ROLES", 422);
    const token = createSessionToken(); const email = input.email.toLowerCase();
    const invitation = await prisma.invitation.create({ data: { tenantId: context.tenantId, email, roleCodes: roles.map(({ code }) => code), tokenHash: token.hash, createdById: context.userId, expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000) }, select: { publicId: true, expiresAt: true } });
    await prisma.$transaction([
      prisma.outboxEvent.create({ data: { tenantId: context.tenantId, topic: "identity.invitation.created", payload: { email, invitationUrl: `${process.env.APP_URL ?? "http://localhost:3000"}/aceptar-invitacion?token=${token.raw}` } } }),
      prisma.auditEvent.create({ data: { tenantId: context.tenantId, actorUserId: context.userId, action: "USER_INVITED", module: "identity", entityType: "invitation", entityId: invitation.publicId, current: { email, roleCodes: input.roleCodes } } }),
    ]);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) { return apiError(error, "No fue posible crear la invitación."); }
}
