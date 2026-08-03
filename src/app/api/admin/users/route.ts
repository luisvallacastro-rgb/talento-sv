import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { requirePermission } from "@/modules/authorization/domain/access-context";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function GET() {
  try {
    const context = await getCurrentSession(); if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401); requirePermission(context, "users.manage");
    const memberships = await prisma.membership.findMany({ where: { tenantId: context.tenantId }, orderBy: { user: { displayName: "asc" } }, select: { status: true, user: { select: { publicId: true, email: true, displayName: true, active: true } }, roles: { select: { role: { select: { code: true, name: true } } } } } });
    return NextResponse.json({ users: memberships.map(({ user, status, roles }) => ({ ...user, membershipStatus: status, roles: roles.map(({ role }) => role) })) });
  } catch (error) { return apiError(error, "No fue posible consultar los usuarios."); }
}
