import Link from "next/link";

export function SiteHeader() {
  return <header className="site-header"><Link className="brand" href="/"><span>TSV</span><b>Talento SV</b></Link><nav aria-label="Principal"><Link href="/servicios">Servicios</Link><Link href="/vacantes">Vacantes</Link><Link href="/nosotros">Nosotros</Link><Link href="/contacto">Contacto</Link></nav><Link className="login-link" href="/iniciar-sesion">Iniciar sesión <i>↗</i></Link></header>;
}
