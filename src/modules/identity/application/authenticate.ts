import type { PrismaClient } from "@prisma/client";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { verifyPassword } from "../domain/password";
import { createSessionToken } from "../domain/session-token";

const LOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export type LoginCommand = { email: string; password: string; tenantSlug: string; ipAddress?: string; userAgent?: string };

export async function authenticate(prisma: PrismaClient, command: LoginCommand) {
  const email = command.email.trim().toLowerCase();
  const since = new Date(Date.now() - LOCK_WINDOW_MS);
  const failures = await prisma.loginAttempt.count({ where: { email, successful: false, occurredAt: { gte: since } } });
  if (failures >= MAX_FAILURES) throw new ApplicationError("Acceso temporalmente bloqueado. Intente más tarde.", "LOGIN_LOCKED", 429);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { tenant: { slug: command.tenantSlug, active: true }, status: "ACTIVE" },
        include: { tenant: true, roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      },
    },
  });
  const membership = user?.memberships[0];
  const valid = Boolean(user?.active && user.passwordHash && membership && await verifyPassword(command.password, user.passwordHash));
  await prisma.loginAttempt.create({ data: { email, ipAddress: command.ipAddress, successful: valid } });
  if (!valid || !user || !membership) throw new ApplicationError("Credenciales inválidas.", "INVALID_CREDENTIALS", 401);

  await prisma.loginAttempt.deleteMany({ where: { email, successful: false } });

  const token = createSessionToken();
  const session = await prisma.session.create({
    data: {
      tokenHash: token.hash, userId: user.id, tenantId: membership.tenantId, membershipId: membership.id,
      userAgent: command.userAgent, ipAddress: command.ipAddress, expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    },
  });
  await prisma.auditEvent.create({ data: { tenantId: membership.tenantId, actorUserId: user.id, action: "LOGIN", module: "identity", ipAddress: command.ipAddress } });
  const permissions = membership.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.code));
  return { token: token.raw, expiresAt: session.expiresAt, user: { publicId: user.publicId, displayName: user.displayName, email: user.email, mustChangePassword: user.mustChangePassword }, tenant: { publicId: membership.tenant.publicId, name: membership.tenant.name }, permissions };
}
