import { ApplicationError } from "@/shared/domain/errors/application-error";
const tokenPattern=/{{\s*([a-zA-Z0-9_.]+)\s*}}/g;
export function renderTemplate(template:string,values:Record<string,string>):string{return template.replace(tokenPattern,(_,key:string)=>{const value=values[key];if(value===undefined)throw new ApplicationError(`Falta la variable de plantilla ${key}.`,"MISSING_TEMPLATE_VARIABLE",422);return value})}
