import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "@/modules/identity/application/authenticate";
import { SESSION_COOKIE } from "@/modules/identity/infrastructure/current-session";
import { ApplicationError } from "@/shared/domain/errors/application-error";
import { prisma } from "@/shared/infrastructure/database/prisma";

const loginSchema = z.object({ email: z.email(), password: z.string().min(8).max(200), tenantSlug: z.string().min(2).max(80) });

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    if (process.env.DEMO_CLIENT_ENABLED === "true" && input.tenantSlug === "grupo-horizonte" && input.email.toLowerCase() === "cliente@grupohorizonte.demo" && input.password === process.env.DEMO_CLIENT_PASSWORD) {
      const response = NextResponse.json({ user: { publicId: "demo-client-user", displayName: "María Fernández", email: input.email }, tenant: { publicId: "demo-tenant", name: "Grupo Horizonte" }, permissions: ["vacancies.read.own", "candidates.read.presented"] });
      response.cookies.set(SESSION_COOKIE, process.env.DEMO_CLIENT_TOKEN!, { httpOnly: true, secure: false, sameSite: "lax", path: "/", expires: new Date(Date.now() + 8 * 60 * 60 * 1000) });
      return response;
    }
    const result = await authenticate(prisma, { ...input, ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(), userAgent: request.headers.get("user-agent") ?? undefined });
    const response = NextResponse.json({ user: result.user, tenant: result.tenant, permissions: result.permissions });
    response.cookies.set(SESSION_COOKIE, result.token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: result.expiresAt });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Revise los datos enviados.", fields: z.flattenError(error).fieldErrors } }, { status: 422 });
    if (error instanceof ApplicationError) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "No fue posible iniciar sesión." } }, { status: 500 });
  }
}
