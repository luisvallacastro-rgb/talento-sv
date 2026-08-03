import { cookies } from "next/headers";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { hashSessionToken } from "../domain/session-token";
import type { AccessContext } from "@/modules/authorization/domain/access-context";

export const SESSION_COOKIE = "talento_session";

export type CurrentSession = AccessContext & { sessionId: bigint; userPublicId: string; sessionPublicId: string };

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  if (process.env.DEMO_CLIENT_ENABLED === "true" && raw === process.env.DEMO_CLIENT_TOKEN) {
    return { sessionId: 0n, sessionPublicId: "demo-session", userPublicId: "demo-client-user", userId: 0n, tenantId: 0n, membershipId: 0n, permissions: new Set(["vacancies.read.own", "candidates.read.presented"]) };
  }
  const session = await prisma.session.findFirst({
    where: { tokenHash: hashSessionToken(raw), revokedAt: null, expiresAt: { gt: new Date() }, user: { active: true }, membership: { status: "ACTIVE" } },
    include: { user: { select: { publicId: true } }, membership: { include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } } },
  });
  if (!session) return null;
  if (Date.now() - session.lastSeenAt.getTime() > 5 * 60 * 1000) {
    await prisma.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
  }
  return { sessionId: session.id, sessionPublicId: session.publicId, userPublicId: session.user.publicId, userId: session.userId, tenantId: session.tenantId, membershipId: session.membershipId, permissions: new Set(session.membership.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.code))) };
}
