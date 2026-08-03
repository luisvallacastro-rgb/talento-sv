import type { PrismaClient } from "@prisma/client";
import { createSessionToken, hashSessionToken } from "../domain/session-token";
import { hashPassword } from "../domain/password";
import { ApplicationError } from "@/shared/domain/errors/application-error";

export async function requestPasswordReset(prisma: PrismaClient, emailInput: string, appUrl: string): Promise<void> {
  const email = emailInput.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, active: true } });
  if (!user?.active) return;
  const token = createSessionToken();
  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: token.hash, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } }),
    prisma.outboxEvent.create({ data: { topic: "identity.password-reset.requested", payload: { email, resetUrl: `${appUrl}/restablecer-contrasena?token=${token.raw}` } } }),
  ]);
}

export async function resetPassword(prisma: PrismaClient, rawToken: string, password: string): Promise<void> {
  const token = await prisma.passwordResetToken.findFirst({ where: { tokenHash: hashSessionToken(rawToken), usedAt: null, expiresAt: { gt: new Date() } } });
  if (!token) throw new ApplicationError("El enlace no es válido o expiró.", "INVALID_RESET_TOKEN", 400);
  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash, mustChangePassword: false } }),
    prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.session.updateMany({ where: { userId: token.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    prisma.auditEvent.create({ data: { actorUserId: token.userId, action: "PASSWORD_RESET", module: "identity" } }),
  ]);
}
