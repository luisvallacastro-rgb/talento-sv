"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items=[
  ["/portal","Resumen","⌂"],
  ["/portal/procesos","Procesos","◫"],
  ["/portal/ternas","Ternas","◎"],
  ["/portal/solicitudes","Solicitudes","＋"],
  ["/portal/mensajes","Mensajes","◌"],
  ["/portal/reportes","Reportes","↗"],
  ["/portal/seguridad","Seguridad","◇"],
] as const;

export function ClientPortalShell({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  return <div className="portal-shell"><aside><Link className="brand portal-brand" href="/"><span>TSV</span><b>Talento SV</b></Link><nav>{items.map(([href,label,icon])=><Link key={href} className={pathname===href||href!=="/portal"&&pathname.startsWith(`${href}/`)?"active":""} href={href}><i>{icon}</i>{label}{label==="Mensajes"&&<small>2</small>}</Link>)}</nav><div className="portal-user"><i>MF</i><div><strong>María Fernández</strong><span>Grupo Horizonte</span></div></div></aside><main>{children}</main></div>;
}
