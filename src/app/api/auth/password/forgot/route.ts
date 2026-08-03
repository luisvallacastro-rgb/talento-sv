import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/modules/identity/application/password-reset";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { apiError } from "@/shared/presentation/api-error";

export async function POST(request: Request) {
  try {
    const { email } = z.object({ email: z.email() }).parse(await request.json());
    await requestPasswordReset(prisma, email, process.env.APP_URL ?? "http://localhost:3000");
    return NextResponse.json({ message: "Si la cuenta existe, recibirá instrucciones para continuar." });
  } catch (error) { return apiError(error, "No fue posible procesar la solicitud."); }
}
