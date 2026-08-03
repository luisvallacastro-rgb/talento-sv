import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/modules/identity/infrastructure/current-session";
import { hashSessionToken } from "@/modules/identity/domain/session-token";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function POST() {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (raw) await prisma.session.updateMany({ where: { tokenHash: hashSessionToken(raw), revokedAt: null }, data: { revokedAt: new Date() } });
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true });
}
