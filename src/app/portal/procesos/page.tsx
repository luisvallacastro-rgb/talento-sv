import Link from "next/link";
import {ModuleTitle} from "@/components/portal-module-title";
const processes=[
  {title:"Dirección de Operaciones",status:"Terna disponible",progress:78,candidates:3,date:"15 sep",href:"/portal/procesos/demo-operaciones"},
  {title:"Gerencia Comercial",status:"Evaluación",progress:54,candidates:8,date:"28 sep",href:"#"},
  {title:"Analista Financiero",status:"Búsqueda",progress:28,candidates:14,date:"10 oct",href:"#"},
];
export default function Page(){return <div className="portal-module"><ModuleTitle eyebrow="Procesos" title="Cada búsqueda, bajo control." text="Avance, candidatos y próximos pasos en tiempo real." action={<Link className="button" href="/portal/solicitudes">Nueva solicitud</Link>}/><div className="filter-row"><button className="active">Activos · 3</button><button>Completados · 4</button><button>Todos</button><input placeholder="Buscar proceso"/></div><section className="process-cards">{processes.map((p,i)=><Link href={p.href} className="process-card" key={p.title}><div className="process-index">0{i+1}</div><span className="status-pill">{p.status}</span><h2>{p.title}</h2><div className="process-meta"><span><b>{p.candidates}</b> candidatos</span><span><b>{p.date}</b> fecha objetivo</span></div><div className="module-progress"><i style={{width:`${p.progress}%`}}/></div><footer><span>{p.progress}% completado</span><b>Ver proceso →</b></footer></Link>)}</section></div>}
