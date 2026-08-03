import { NextResponse } from "next/server";
import { authorized } from "@/shared/presentation/authorized";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { ApplicationError } from "@/shared/domain/errors/application-error";

export async function GET(_: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const context = await authorized("candidates.read.presented");
    const { publicId } = await params;
    const shortlist = await prisma.shortlist.findFirst({
      where: { publicId, status: "PUBLISHED", vacancy: { clientTenantId: context.tenantId } },
      select: {
        publicId: true, presentedAt: true, vacancy: { select: { publicId: true, title: true } },
        entries: {
          orderBy: { position: "asc" },
          select: {
            position: true, inclusionReason: true,
            application: {
              select: {
                publicId: true, status: true,
                candidate: { select: { publicId: true, firstName: true, lastName: true, experiences: { orderBy: { startedOn: "asc" }, select: { startedOn: true, endedOn: true } }, educations: { take: 3, select: { degree: true, institution: true } }, competencies: { take: 10, select: { name: true, level: true } }, assessmentAssignments: { where: { result: { clientVisible: true } }, select: { result: { select: { rawScore: true, interpretation: true } } } } } },
                scoreRuns: { orderBy: { calculatedAt: "desc" }, take: 1, select: { total: true, components: { select: { variableCode: true, weightedValue: true } } } },
                clientDecisions: { where: { tenantId: context.tenantId }, orderBy: { createdAt: "desc" }, select: { type: true, reason: true, createdAt: true } },
              },
            },
          },
        },
      },
    });
    if (!shortlist) throw new ApplicationError("La terna no existe.", "NOT_FOUND", 404);
    const entries = shortlist.entries.map((entry) => {
      const latestScore = entry.application.scoreRuns[0];
      return { ...entry, application: { ...entry.application, scoreRuns: undefined, score: latestScore ? { total: Number(latestScore.total), components: latestScore.components.map((component) => ({ variableCode: component.variableCode, weightedValue: Number(component.weightedValue) })) } : null, candidate: { ...entry.application.candidate, assessmentAssignments: entry.application.candidate.assessmentAssignments.map(({ result }) => result ? { ...result, rawScore: Number(result.rawScore) } : null).filter(Boolean) } } };
    });
    return NextResponse.json({ shortlist: { ...shortlist, entries } });
  } catch (error) {
    return apiError(error, "No fue posible comparar la terna.");
  }
}
