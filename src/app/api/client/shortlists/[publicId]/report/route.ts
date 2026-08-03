import { authorized } from "@/shared/presentation/authorized";
import { apiError } from "@/shared/presentation/api-error";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { ApplicationError } from "@/shared/domain/errors/application-error";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]!);
export async function GET(_: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const context = await authorized("candidates.read.presented"); const { publicId } = await params;
    const shortlist = await prisma.shortlist.findFirst({ where: { publicId, status: "PUBLISHED", vacancy: { clientTenantId: context.tenantId } }, select: { vacancy: { select: { title: true } }, presentedAt: true, entries: { orderBy: { position: "asc" }, select: { position: true, inclusionReason: true, application: { select: { candidate: { select: { firstName: true, lastName: true, competencies: { take: 10 } } }, scoreRuns: { orderBy: { calculatedAt: "desc" }, take: 1, select: { total: true } } } } } } } });
    if (!shortlist) throw new ApplicationError("La terna no existe.", "NOT_FOUND", 404);
    const rows = shortlist.entries.map((entry) => `<article><div class="position">${entry.position}</div><h2>${escapeHtml(entry.application.candidate.firstName)} ${escapeHtml(entry.application.candidate.lastName)}</h2><div class="score">${entry.application.scoreRuns[0] ? Number(entry.application.scoreRuns[0].total).toFixed(1) : "N/D"} / 100</div><p><b>Competencias:</b> ${entry.application.candidate.competencies.map((x) => escapeHtml(x.name)).join(", ")}</p><p><b>Motivo de inclusión:</b> ${escapeHtml(entry.inclusionReason)}</p></article>`).join("");
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe ejecutivo · ${escapeHtml(shortlist.vacancy.title)}</title><style>body{font-family:Arial;color:#16372f;margin:48px}header{border-bottom:4px solid #d7f06b;padding-bottom:24px}h1{font-size:38px}article{position:relative;border-bottom:1px solid #ccd4ce;padding:28px 0}.position{position:absolute;right:0;font-size:36px;color:#0c745f}.score{font-size:24px;font-weight:bold;color:#0c745f}@media print{body{margin:20mm}}</style></head><body><header><small>TALENTO SV · INFORME EJECUTIVO</small><h1>${escapeHtml(shortlist.vacancy.title)}</h1><p>Terna presentada ${shortlist.presentedAt?.toLocaleDateString("es-SV") ?? ""}</p></header>${rows}<footer><p>Documento confidencial. La puntuación es un apoyo explicable; la decisión final conserva intervención humana.</p></footer></body></html>`;
    await prisma.auditEvent.create({ data: { tenantId: context.tenantId, actorUserId: context.userId, action: "EXECUTIVE_REPORT_DOWNLOADED", module: "client_portal", entityType: "shortlist", entityId: publicId } });
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "content-disposition": `attachment; filename="informe-terna-${publicId}.html"`, "cache-control": "private, no-store" } });
  } catch (error) { return apiError(error, "No fue posible generar el informe."); }
}
