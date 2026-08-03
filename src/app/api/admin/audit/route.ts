import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { requirePermission } from "@/modules/authorization/domain/access-context";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

const querySchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(25), module: z.string().max(60).optional() });
export async function GET(request: Request) {
  try {
    const context = await getCurrentSession(); if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401); requirePermission(context, "audit.read");
    const url = new URL(request.url); const query = querySchema.parse(Object.fromEntries(url.searchParams));
    const where = { tenantId: context.tenantId, ...(query.module ? { module: query.module } : {}) };
    const [events, total] = await prisma.$transaction([
      prisma.auditEvent.findMany({ where, orderBy: { occurredAt: "desc" }, skip: (query.page - 1) * query.pageSize, take: query.pageSize, select: { id: true, action: true, module: true, entityType: true, entityId: true, ipAddress: true, reason: true, occurredAt: true, actor: { select: { publicId: true, displayName: true } } } }),
      prisma.auditEvent.count({ where }),
    ]);
    return NextResponse.json({ events: events.map(({ id: _id, ...event }) => event), page: query.page, pageSize: query.pageSize, total });
  } catch (error) { return apiError(error, "No fue posible consultar la auditoría."); }
}
