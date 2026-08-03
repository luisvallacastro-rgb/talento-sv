import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyInternalSecret } from "@/shared/security/internal-secret";
import { processEmailOutbox } from "@/modules/notifications/application/process-outbox";
import { prisma } from "@/shared/infrastructure/database/prisma";

export async function POST(request:Request){if(!verifyInternalSecret(request.headers.get("x-worker-secret"),process.env.WORKER_SECRET))return NextResponse.json({error:{code:"UNAUTHORIZED",message:"No autorizado."}},{status:401});const body=await request.json().catch(()=>({}));const {limit}=z.object({limit:z.number().int().min(1).max(50).default(20)}).parse(body);return NextResponse.json(await processEmailOutbox(prisma,limit))}
