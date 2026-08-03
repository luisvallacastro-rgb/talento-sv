import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { apiError } from "@/shared/presentation/api-error";
import { ApplicationError } from "@/shared/domain/errors/application-error";

const base = z.object({ name: z.string().trim().min(2).max(120), email: z.email().max(180), phone: z.string().trim().max(30).optional(), company: z.string().trim().max(160).optional(), message: z.string().trim().min(10).max(4000), website: z.string().max(0), startedAt: z.number().int().positive() });
const schema = z.discriminatedUnion("type", [
  base.extend({ type: z.literal("CONTACT") }),
  base.extend({ type: z.literal("QUOTE"), service: z.string().min(2).max(100), employees: z.string().max(40).optional() }),
  base.extend({ type: z.literal("STAFF_REQUEST"), position: z.string().min(2).max(140), openings: z.number().int().min(1).max(100), location: z.string().min(2).max(140) }),
  base.extend({ type: z.literal("RESUME"), professionalArea: z.string().min(2).max(140), resumeUrl: z.url().max(1000).optional() }),
]);

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    if (Date.now() - input.startedAt < 2_000) throw new ApplicationError("No fue posible validar el formulario.", "SPAM_REJECTED", 400);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = createHmac("sha256", process.env.AUTH_SECRET ?? "local-development-only").update(ip).digest("hex");
    const recent = await prisma.publicInquiry.count({ where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, OR: [{ email: input.email.toLowerCase() }, { ipHash }] } });
    if (recent >= 5) throw new ApplicationError("Ha enviado varias solicitudes. Intente nuevamente más tarde.", "RATE_LIMITED", 429);
    const { website: _honeypot, startedAt: _startedAt, type, email, name, phone, company, ...payload } = input;
    const inquiry = await prisma.publicInquiry.create({ data: { type, email: email.toLowerCase(), name, phone, company, payload, ipHash }, select: { publicId: true } });
    await prisma.outboxEvent.create({ data: { topic: "public.inquiry.created", payload: { inquiryPublicId: inquiry.publicId, type } } });
    return NextResponse.json({ message: "Recibimos su información. Nuestro equipo le contactará pronto." }, { status: 201 });
  } catch (error) { return apiError(error, "No fue posible enviar el formulario."); }
}
