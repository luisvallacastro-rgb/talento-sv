"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const questions = [
  { q: "¿Qué servicios ofrecen?", a: "Reclutamiento especializado, evaluaciones psicométricas y selección por competencias, siempre con acompañamiento profesional.", href: "/servicios", label: "Ver servicios" },
  { q: "¿Cuánto tarda un proceso?", a: "Depende del perfil y del mercado. Desde el inicio definimos una fecha objetivo y comunicamos cada avance con claridad." },
  { q: "¿Qué incluye una terna?", a: "Tres finalistas comparables y validados, acompañados de evidencia profesional para facilitar una decisión informada." },
  { q: "¿Cómo solicito una cotización?", a: "Cuéntenos el puesto, el nivel de experiencia y la necesidad de su empresa. Prepararemos una propuesta a la medida.", href: "/cotizacion", label: "Solicitar cotización" },
  { q: "¿Dónde veo las vacantes?", a: "Puede consultar las oportunidades activas y enviar su información desde nuestra sección de vacantes.", href: "/vacantes", label: "Ver vacantes" },
];

export function FaqChatbox() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  if (pathname.startsWith("/portal")) return null;
  const answer = selected === null ? null : questions[selected];

  return <aside className={`faq-chatbox${open ? " is-open" : ""}`} aria-label="Asistente de preguntas frecuentes">
    {open && <div className="faq-chat-panel" role="dialog" aria-modal="false" aria-labelledby="faq-chat-title">
      <header><div><i>●</i><span><strong id="faq-chat-title">Talento SV</strong><small>Respuestas rápidas</small></span></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat">×</button></header>
      <div className="faq-chat-body">
        <p className="chat-message">¡Hola! ¿En qué podemos orientarle?</p>
        {answer && <div className="chat-answer" aria-live="polite"><span>{answer.q}</span><p>{answer.a}</p>{answer.href && <Link href={answer.href}>{answer.label} →</Link>}</div>}
        <div className="chat-questions">{questions.map((item, index) => <button type="button" className={selected === index ? "active" : ""} onClick={() => setSelected(index)} key={item.q}>{item.q}</button>)}</div>
      </div>
      <footer><Link href="/contacto">Hablar con una persona <span>→</span></Link></footer>
    </div>}
    <button className="faq-chat-trigger" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Cerrar asistente" : "Abrir asistente de preguntas"}><span>{open ? "×" : "?"}</span><b>{open ? "Cerrar" : "¿Tiene preguntas?"}</b></button>
  </aside>;
}
