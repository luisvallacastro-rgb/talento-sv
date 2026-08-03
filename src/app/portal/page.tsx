import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/modules/identity/infrastructure/current-session";
import { prisma } from "@/shared/infrastructure/database/prisma";

export default async function PortalPage(){
  const s=await getCurrentSession(); if(!s)redirect("/iniciar-sesion");
  if(s.userPublicId==="demo-client-user")return <DemoPortal/>;
  const clientMode=s.permissions.has("candidates.read.presented")&&!s.permissions.has("candidates.manage");
  if(!clientMode){
    const [active,candidates,interviews]=await Promise.all([prisma.vacancy.count({where:{ownerTenantId:s.tenantId,status:{in:["REVIEW","PUBLISHED","PAUSED"]}}}),prisma.candidate.count({where:{tenantId:s.tenantId,deletedAt:null}}),prisma.interview.count({where:{interviewerUserId:s.userId,status:"SCHEDULED",scheduledAt:{gte:new Date()}}})]);
    return <><div className="portal-title"><span className="eyebrow">Panel interno</span><h1>Operación de reclutamiento</h1><p>Resumen del trabajo activo en su empresa.</p></div><section className="metric-grid"><Metric n={active} label="Vacantes activas"/><Metric n={candidates} label="Candidatos"/><Metric n={interviews} label="Entrevistas próximas"/></section></>;
  }
  const processes=await prisma.vacancy.findMany({where:{clientTenantId:s.tenantId,deletedAt:null},orderBy:{updatedAt:"desc"},select:{publicId:true,title:true,status:true,targetDate:true,applications:{select:{presentedToClientAt:true}},shortlists:{where:{status:"PUBLISHED"},select:{publicId:true}}}});
  return <><div className="portal-title"><span className="eyebrow">Portal de cliente</span><h1>Sus procesos, sin perder el hilo.</h1><p>Consulte avances, candidatos presentados y decisiones pendientes.</p></div><section className="metric-grid"><Metric n={processes.filter(x=>!["CLOSED","CANCELLED"].includes(x.status)).length} label="Procesos activos"/><Metric n={processes.reduce((n,x)=>n+x.applications.filter(a=>a.presentedToClientAt).length,0)} label="Candidatos presentados"/><Metric n={processes.filter(x=>x.shortlists.length).length} label="Ternas disponibles"/></section><section className="portal-list"><div className="list-heading"><h2>Procesos recientes</h2><Link href="/portal/solicitudes">Nueva solicitud</Link></div>{processes.map(p=><Link className="process-row" href={`/portal/procesos/${p.publicId}`} key={p.publicId}><div><span>{p.status}</span><h3>{p.title}</h3></div><div><strong>{p.applications.filter(a=>a.presentedToClientAt).length}</strong><small>presentados</small></div><div><strong>{p.shortlists.length?"Disponible":"En proceso"}</strong><small>terna</small></div><b>→</b></Link>)}</section></>;
}

function DemoPortal(){return <><div className="portal-title"><span className="eyebrow">Portal de cliente · Demo</span><h1>Buenos días, María.</h1><p>Sus procesos y decisiones, en un solo lugar.</p></div><section className="metric-grid"><Metric n={1} label="Proceso activo"/><Metric n={3} label="Candidatos presentados"/><Metric n={1} label="Terna disponible"/></section><section className="portal-list"><div className="list-heading"><h2>Requiere su atención</h2><Link href="/portal/solicitudes">Nueva solicitud</Link></div><Link className="process-row" href="/portal/procesos/demo-operaciones"><div><span>PUBLICADO</span><h3>Dirección de Operaciones</h3></div><div><strong>3</strong><small>presentados</small></div><div><strong>Disponible</strong><small>terna</small></div><b>→</b></Link></section></>}
function Metric({n,label}:{n:number;label:string}){return <article><strong>{n}</strong><span>{label}</span></article>}
