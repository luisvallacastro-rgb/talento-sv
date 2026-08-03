"use client";

import { useRef } from "react";

export function TalentDemo() {
  const demoRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty("--pointer-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--tilt-x", `${(0.5 - y) * 3}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${(x - 0.5) * 4}deg`);
  }

  function resetPointer() {
    demoRef.current?.style.setProperty("--tilt-x", "0deg");
    demoRef.current?.style.setProperty("--tilt-y", "0deg");
  }

  return <div ref={demoRef} className="talent-visual clear-talent-demo" aria-label="Cómo convertimos 48 candidatos en una terna de tres finalistas" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
    <div className="demo-pointer-light"/>
    <div className="demo-topbar"><div className="demo-dots"><i/><i/><i/></div><span>Proceso · Dirección de Operaciones</span><b><i/> Especialista activo</b></div>
    <div className="clear-demo-heading"><span>Así construimos una terna</span><h2>De 48 candidatos a<br/><strong>3 finalistas recomendados.</strong></h2><p>Una terna es la selección final de tres personas que mejor cumplen el perfil.</p></div>
    <div className="selection-flow">
      <div className="selection-column selection-found"><div className="selection-title"><span>1</span><div><strong>Búsqueda amplia</strong><small>Encontramos talento relevante</small></div></div><div className="candidate-cloud">{Array.from({length:18},(_,i)=><i key={i}/>)}</div><div className="selection-result"><strong>48</strong><span>candidatos<br/>identificados</span></div></div>
      <div className="flow-arrow"><i/><span>Filtramos</span></div>
      <div className="selection-column selection-evaluate"><div className="selection-title"><span>2</span><div><strong>Evaluación experta</strong><small>Comparamos la misma evidencia</small></div></div><div className="criteria-list"><div><i>✓</i><span>Experiencia relevante</span><b>92%</b></div><div><i>✓</i><span>Liderazgo</span><b>89%</b></div><div><i>✓</i><span>Ajuste al equipo</span><b>94%</b></div><em/></div><div className="selection-result"><strong>12</strong><span>candidatos<br/>entrevistados</span></div></div>
      <div className="flow-arrow second"><i/><span>Validamos</span></div>
      <div className="selection-column selection-final"><div className="selection-title"><span>3</span><div><strong>Terna recomendada</strong><small>Lista para tomar una decisión</small></div></div><div className="finalists"><div><i>LR</i><span><strong>Laura R.</strong><small>92% de afinidad</small></span><b>1</b></div><div><i>AM</i><span><strong>Andrés M.</strong><small>90% de afinidad</small></span><b>2</b></div><div><i>JR</i><span><strong>Julia R.</strong><small>88% de afinidad</small></span><b>3</b></div></div><div className="final-message">✓ Tres perfiles comparables y validados</div></div>
    </div>
    <div className="demo-glow"/>
  </div>;
}
