import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";

export async function GET() {
  const context = await getCurrentSession();
  if (!context) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Debe iniciar sesión." } }, { status: 401 });
  return NextResponse.json({ tenantId: context.tenantId.toString(), permissions: [...context.permissions] });
}
