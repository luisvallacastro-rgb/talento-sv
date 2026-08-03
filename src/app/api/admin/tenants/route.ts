import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { requirePermission } from "@/modules/authorization/domain/access-context";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

const schema = z.object({ name: z.string().trim().min(2).max(160), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), type: z.enum(["RECRUITER", "CLIENT"]) });
async function authorized() { const context = await getCurrentSession(); if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401); requirePermission(context, "platform.manage"); return context; }

export async function GET() {
  try { await authorized(); return NextResponse.json({ tenants: await prisma.tenant.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { publicId: true, name: true, slug: true, type: true, active: true } }) }); }
  catch (error) { return apiError(error, "No fue posible consultar las empresas."); }
}
export async function POST(request: Request) {
  try {
    const context = await authorized(); const input = schema.parse(await request.json());
    const tenant = await prisma.tenant.create({ data: input, select: { publicId: true, name: true, slug: true, type: true } });
    await prisma.auditEvent.create({ data: { tenantId: context.tenantId, actorUserId: context.userId, action: "TENANT_CREATED", module: "tenancy", entityType: "tenant", entityId: tenant.publicId, current: tenant } });
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) { return apiError(error, "No fue posible crear la empresa."); }
}
