import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { prisma } from "@/shared/infrastructure/database/prisma";
import { ClientDecisionActions } from "@/components/client-decision-actions";
import { ProcessCommentForm } from "@/components/process-comment-form";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const session = await getCurrentSession(); if (!session) redirect("/iniciar-sesion");
  const { publicId } = await params;
  if (session.userPublicId === "demo-client-user" && publicId === "demo-operaciones") return <DemoProcess />;
  const process = await prisma.vacancy.findFirst({
    where: { publicId, clientTenantId: session.tenantId, deletedAt: null },
    select: {
      title: true, status: true, summary: true, targetDate: true,
      applications: { where: { presentedToClientAt: { not: null } }, select: { publicId: true, status: true, candidate: { select: { firstName: true, lastName: true, competencies: { take: 6 } } }, scoreRuns: { orderBy: { calculatedAt: "desc" }, take: 1, select: { total: true } } } },
      statusHistory: { orderBy: { changedAt: "asc" } },
      shortlists: { where: { status: "PUBLISHED" }, orderBy: { presentedAt: "desc" }, select: { publicId: true, presentedAt: true } },
      comments: { where: { visibility: "CLIENT", deletedAt: null }, orderBy: { createdAt: "asc" }, select: { publicId: true, body: true, createdAt: true, author: { select: { displayName: true } } } },
    },
  });
  if (!process) notFound(); const shortlist = process.shortlists[0];
  return <main className="portal-detail"><a href="/portal">← Volver</a><header><span className="eyebrow">{process.status}</span><h1>{process.title}</h1><p>{process.summary}</p></header><section><h2>Línea de tiempo</h2><ol className="timeline">{process.statusHistory.map((item, index) => <li key={index}><i /><div><strong>{item.toStatus}</strong><small>{item.changedAt.toLocaleDateString("es-SV")}</small></div></li>)}</ol></section>{shortlist && <section className="shortlist-banner"><div><span className="eyebrow">Terna disponible</span><h2>Compare la selección presentada.</h2></div><div><a className="button" href={`/portal/ternas/${shortlist.publicId}`}>Comparar candidatos</a><a className="text-link" href={`/api/client/shortlists/${shortlist.publicId}/report`}>Descargar informe</a></div></section>}<section><h2>Candidatos presentados</h2><div className="candidate-grid">{process.applications.map((application) => <article key={application.publicId}><span>{application.status}</span><h3>{application.candidate.firstName} {application.candidate.lastName}</h3><strong className="candidate-score">{application.scoreRuns[0] ? `${Number(application.scoreRuns[0].total).toFixed(1)} puntos` : "Sin scoring"}</strong><p>{application.candidate.competencies.map((competency) => competency.name).join(" · ")}</p><ClientDecisionActions applicationPublicId={application.publicId} /></article>)}</div></section><section className="comments"><h2>Conversación del proceso</h2>{process.comments.map((comment) => <article key={comment.publicId}><strong>{comment.author.displayName}</strong><small>{comment.createdAt.toLocaleString("es-SV")}</small><p>{comment.body}</p></article>)}<ProcessCommentForm processPublicId={publicId} /></section></main>;
}

function DemoProcess(){
  const candidates=[
    {id:"demo-laura",name:"Laura Ramírez",score:92,skills:"Liderazgo · Estrategia · Optimización de procesos"},
    {id:"demo-andres",name:"Andrés Molina",score:90,skills:"Gestión regional · Negociación · Analítica"},
    {id:"demo-julia",name:"Julia Reyes",score:88,skills:"Cultura de equipo · Eficiencia · Transformación"},
  ];
  return <main className="portal-detail"><a href="/portal">← Volver</a><header><span className="eyebrow">PUBLICADO · DEMO</span><h1>Dirección de Operaciones</h1><p>Liderar operaciones regionales, eficiencia y crecimiento del equipo.</p></header><section><h2>Línea de tiempo</h2><ol className="timeline"><li><i/><div><strong>Solicitud recibida</strong><small>3 ago 2026</small></div></li><li><i/><div><strong>Evaluación completada</strong><small>7 ago 2026</small></div></li><li><i/><div><strong>Terna presentada</strong><small>10 ago 2026</small></div></li></ol></section><section className="shortlist-banner"><div><span className="eyebrow">Terna disponible</span><h2>Tres perfiles listos para decidir.</h2></div><div><span className="button">Comparación activa</span></div></section><section><h2>Candidatos presentados</h2><div className="candidate-grid">{candidates.map(candidate=><article key={candidate.id}><span>FINALISTA</span><h3>{candidate.name}</h3><strong className="candidate-score">{candidate.score}.0 puntos</strong><p>{candidate.skills}</p><ClientDecisionActions applicationPublicId={candidate.id} demo/></article>)}</div></section><section className="comments"><h2>Conversación del proceso</h2><article><strong>Equipo Talento SV</strong><small>Hoy, 8:30 a. m.</small><p>La terna está lista. Puede marcar favoritos, aprobar avances o solicitar entrevistas desde cada perfil.</p></article></section></main>;
}
