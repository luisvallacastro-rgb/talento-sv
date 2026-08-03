import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/modules/identity/application/password-reset";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { apiError } from "@/shared/presentation/api-error";

const schema = z.object({ token: z.string().min(32), password: z.string().min(12).max(200).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/) });
export async function POST(request: Request) {
  try { const input = schema.parse(await request.json()); await resetPassword(prisma, input.token, input.password); return NextResponse.json({ success: true }); }
  catch (error) { return apiError(error, "No fue posible cambiar la contraseña."); }
}
