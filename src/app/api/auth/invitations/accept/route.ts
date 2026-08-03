import { NextResponse } from "next/server";
import { z } from "zod";
import { hashSessionToken } from "@/modules/identity/domain/session-token";
import { hashPassword } from "@/modules/identity/domain/password";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

const schema = z.object({ token: z.string().min(32), displayName: z.string().trim().min(2).max(120), password: z.string().min(12).max(200).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/) });
export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const invitation = await prisma.invitation.findFirst({ where: { tokenHash: hashSessionToken(input.token), acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } } });
    if (!invitation) throw new ApplicationError("La invitación no es válida o expiró.", "INVALID_INVITATION", 400);
    const roles = await prisma.role.findMany({ where: { tenantId: invitation.tenantId, code: { in: invitation.roleCodes } } });
    if (roles.length !== invitation.roleCodes.length) throw new ApplicationError("La configuración de la invitación cambió.", "INVITATION_ROLES_CHANGED", 409);
    const passwordHash = await hashPassword(input.password);
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({ where: { email: invitation.email }, update: { displayName: input.displayName, passwordHash, active: true }, create: { email: invitation.email, displayName: input.displayName, passwordHash } });
      const membership = await tx.membership.upsert({ where: { tenantId_userId: { tenantId: invitation.tenantId, userId: user.id } }, update: { status: "ACTIVE" }, create: { tenantId: invitation.tenantId, userId: user.id, status: "ACTIVE" } });
      await tx.membershipRole.createMany({ data: roles.map((role) => ({ membershipId: membership.id, roleId: role.id })), skipDuplicates: true });
      await tx.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } });
      await tx.auditEvent.create({ data: { tenantId: invitation.tenantId, actorUserId: user.id, action: "INVITATION_ACCEPTED", module: "identity", entityType: "invitation", entityId: invitation.publicId } });
    });
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error, "No fue posible aceptar la invitación."); }
}
