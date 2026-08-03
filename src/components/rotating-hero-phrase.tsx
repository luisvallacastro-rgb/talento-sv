"use client";

import {useEffect,useState} from "react";

const phrases=[
  "mueve empresas",
  "transforma equipos",
  "impulsa resultados",
  "conecta personas",
  "fortalece organizaciones",
  "desarrolla líderes",
  "genera oportunidades",
  "construye futuro",
  "potencia negocios",
  "inspira crecimiento.",
];

export function RotatingHeroPhrase(){
  const [index,setIndex]=useState(0);
  const [text,setText]=useState(phrases[0]);
  const [deleting,setDeleting]=useState(true);

  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const phrase=phrases[index];
    const finishedTyping=!deleting&&text===phrase;
    const finishedDeleting=deleting&&text.length===0;
    const delay=finishedTyping?1550:finishedDeleting?260:deleting?38:68;
    const timer=window.setTimeout(()=>{
      if(finishedTyping){setDeleting(true);return;}
      if(finishedDeleting){const next=(index+1)%phrases.length;setIndex(next);setDeleting(false);return;}
      setText(deleting?phrase.slice(0,text.length-1):phrase.slice(0,text.length+1));
    },delay);
    return()=>window.clearTimeout(timer);
  },[deleting,index,text]);

  const separator=text.indexOf(" ");
  const firstWord=separator===-1?text:text.slice(0,separator);
  const secondWord=separator===-1?"":text.slice(separator+1);

  return <span className="title-line title-line-dark rotating-line" aria-hidden="true"><span className="rotating-text"><span className="phrase-word">{firstWord}</span><span className="phrase-word">{secondWord}</span></span><i className="typing-cursor"/></span>;
}
