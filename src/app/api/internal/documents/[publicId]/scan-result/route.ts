import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/infrastructure/database/prisma";

function authorized(secret: string | null) {
  const expected = process.env.SCANNER_SECRET;
  if (!expected || !secret) return false;
  const left = Buffer.from(secret); const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  if (!authorized(request.headers.get("x-scanner-secret"))) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "No autorizado." } }, { status: 401 });
  const input = z.object({ clean: z.boolean(), engine: z.string().min(1).max(100), signatureVersion: z.string().max(100).optional() }).parse(await request.json());
  const { publicId } = await params;
  const document = await prisma.document.findFirst({ where: { publicId, status: "QUARANTINED", deletedAt: null } });
  if (!document) return NextResponse.json({ error: { code: "NOT_FOUND", message: "El documento no existe." } }, { status: 404 });
  const status = input.clean ? "AVAILABLE" : "REJECTED";
  await prisma.$transaction([
    prisma.document.update({ where: { id: document.id }, data: { status } }),
    prisma.auditEvent.create({ data: { tenantId: document.tenantId, action: "DOCUMENT_SCAN_COMPLETED", module: "documents", entityType: "document", entityId: publicId, current: { status, engine: input.engine, signatureVersion: input.signatureVersion } } }),
  ]);
  return NextResponse.json({ success: true, status });
}
