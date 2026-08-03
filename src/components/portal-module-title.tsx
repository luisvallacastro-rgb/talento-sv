export function ModuleTitle({eyebrow,title,text,action}:{eyebrow:string;title:string;text:string;action?:React.ReactNode}){
  return <header className="module-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{action}</header>;
}
