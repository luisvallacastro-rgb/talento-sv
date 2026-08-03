import { NextResponse } from "next/server";
import { z } from "zod";
import { ApplicationError } from "@/shared/domain/errors/application-error";

export function apiError(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Revise los datos enviados.", fields: z.flattenError(error).fieldErrors } }, { status: 422 });
  if (error instanceof ApplicationError) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.statusCode });
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: fallback } }, { status: 500 });
}
