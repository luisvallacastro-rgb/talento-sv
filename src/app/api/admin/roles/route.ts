import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { requirePermission } from "@/modules/authorization/domain/access-context";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function GET() {
  try {
    const context = await getCurrentSession(); if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401); requirePermission(context, "roles.manage");
    const roles = await prisma.role.findMany({ where: { tenantId: context.tenantId }, orderBy: { name: "asc" }, select: { code: true, name: true, system: true, permissions: { select: { permission: { select: { code: true, name: true } } } } } });
    return NextResponse.json({ roles: roles.map(({ permissions, ...role }) => ({ ...role, permissions: permissions.map(({ permission }) => permission) })) });
  } catch (error) { return apiError(error, "No fue posible consultar los roles."); }
}
