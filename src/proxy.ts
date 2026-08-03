import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/shared/security/origin";
const unsafe=new Set(["POST","PUT","PATCH","DELETE"]);
export function proxy(request:NextRequest){if(request.nextUrl.pathname.startsWith("/api/")&&unsafe.has(request.method)&&!isAllowedOrigin(request.headers.get("origin"),request.url)){return NextResponse.json({error:{code:"INVALID_ORIGIN",message:"El origen de la solicitud no está autorizado."}},{status:403})}const response=NextResponse.next();response.headers.set("x-request-id",request.headers.get("x-request-id")??crypto.randomUUID());return response}
export const config={matcher:["/api/:path*"]};
