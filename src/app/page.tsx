import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { TalentDemo } from "@/components/talent-demo";
import { RotatingHeroPhrase } from "@/components/rotating-hero-phrase";

const services = [
  { n: "01", t: "El mejor. Punto.", d: "Encontramos talento que otros no ven.", tag: "Búsqueda", impact: "48 → 3", impactLabel: "Una terna decisiva" },
  { n: "02", t: "Evidencia, no corazonadas.", d: "Señales claras para decidir.", tag: "Evaluación", impact: "92%", impactLabel: "Afinidad explicable" },
  { n: "03", t: "Misma vara. Mejor decisión.", d: "Compare lo que realmente importa.", tag: "Comparación", impact: "1:1", impactLabel: "Criterios comparables" },
];

export default function HomePage() {
  return <><SiteHeader/><main className="modern-home">
    <section className="modern-hero">
      <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/><div className="hero-grid"/>
      <div className="hero-copy">
        <div className="live-pill hero-enter hero-enter-pill"><i/> Reclutamiento con visión humana</div>
        <h1 className="hero-title"><span className="sr-only">Talento que mueve empresas.</span><span className="title-line" aria-hidden="true"><i>Talento</i><i>que</i></span><RotatingHeroPhrase/></h1>
        <p className="hero-intro hero-enter">Conectamos decisiones importantes con personas extraordinarias mediante procesos claros, rigurosos y humanos.</p>
        <div className="hero-actions"><Link className="button magnetic" href="/solicitar-personal">Iniciar una búsqueda <span>→</span></Link><Link className="play-link" href="/servicios"><i>↗</i> Explorar servicios</Link></div>
        <div className="hero-proof"><div className="avatar-stack"><span>AM</span><span>JR</span><span>+8</span></div><p><b>Equipos que confían</b><br/>en procesos mejor pensados</p></div>
      </div>
      <div className="hero-demo"><TalentDemo /></div>
      <section className="logo-marquee" aria-label="Principios del servicio"><div className="marquee-track"><div className="marquee-set"><span>Confidencialidad</span><b>✦</b><span>Trazabilidad</span><b>✦</b><span>Criterio profesional</span><b>✦</b><span>Visión humana</span><b>✦</b></div><div className="marquee-set" aria-hidden="true"><span>Confidencialidad</span><b>✦</b><span>Trazabilidad</span><b>✦</b><span>Criterio profesional</span><b>✦</b><span>Visión humana</span><b>✦</b></div></div></section>
    </section>

    <section className="mobile-demo-section" aria-label="Cómo construimos una terna"><TalentDemo /></section>

    <section className="modern-section">
      <Reveal className="section-intro"><span className="eyebrow">Lo hacemos diferente</span><h2>Menos ruido.<br/><em>Mejores decisiones.</em></h2><p>Cada etapa existe por una razón. Usted ve el avance; nosotros cuidamos la profundidad del proceso.</p></Reveal>
      <div className="bento-grid">
        {services.map((service,index)=><Reveal key={service.n} delay={index*60} className={`bento-card bento-${index+1}`}><article><div className="card-number">{service.n}</div><span className="service-tag">{service.tag}</span><h3>{service.t}</h3><p>{service.d}</p><div className="service-impact"><strong>{service.impact}</strong><span>{service.impactLabel}</span><i/></div><Link href="/servicios" aria-label={`Conocer ${service.t}`}>↗</Link></article></Reveal>)}
        <Reveal delay={120} className="bento-card bento-stats"><article><div className="stats-copy"><span className="eyebrow">Control total</span><h3>Todo visible.</h3><p>Sin cajas negras. Sin sorpresas.</p></div><div className="stats-row"><div><strong>15</strong><span>etapas</span></div><div><strong>3</strong><span>finalistas</span></div><div><strong>1</strong><span>responsable</span></div></div></article></Reveal>
      </div>
    </section>

    <section className="process-section">
      <Reveal><span className="eyebrow light-text">Nuestro método</span><h2>Un proceso que se siente<br/>tan claro como se ve.</h2></Reveal>
      <div className="process-line"><i/><Reveal delay={0} className="process-step"><article><b>01</b><h3>Entendemos</h3><p>El puesto, el equipo y el momento del negocio.</p></article></Reveal><Reveal delay={120} className="process-step"><article><b>02</b><h3>Encontramos</h3><p>Personas con experiencia y potencial relevante.</p></article></Reveal><Reveal delay={240} className="process-step"><article><b>03</b><h3>Evaluamos</h3><p>Evidencia consistente, explicable y profesional.</p></article></Reveal><Reveal delay={360} className="process-step"><article><b>04</b><h3>Acompañamos</h3><p>Hasta que la decisión correcta queda clara.</p></article></Reveal></div>
    </section>

    <section className="closing-section">
      <div className="quote-section"><Reveal><blockquote>“La tecnología organiza el proceso.<br/><em>El criterio humano decide.</em>”</blockquote></Reveal></div>
      <div className="modern-cta"><div className="cta-orb"/><Reveal><span className="eyebrow">Su próxima contratación</span><h2>Hagamos que cuente.</h2><p>Cuéntenos qué necesita y diseñaremos una búsqueda a la medida.</p><div><Link className="button light magnetic" href="/cotizacion">Solicitar cotización <span>→</span></Link><Link href="/contacto">Hablar con el equipo</Link></div></Reveal></div>
    </section>
  </main><SiteFooter/></>;
}
