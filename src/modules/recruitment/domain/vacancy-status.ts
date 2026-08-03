import type { VacancyStatus } from "@prisma/client";
import { ApplicationError } from "@/shared/domain/errors/application-error";
const transitions:Record<VacancyStatus,readonly VacancyStatus[]>={DRAFT:["REVIEW","CANCELLED"],REVIEW:["DRAFT","PUBLISHED","CANCELLED"],PUBLISHED:["PAUSED","CLOSED","CANCELLED"],PAUSED:["PUBLISHED","CLOSED","CANCELLED"],CLOSED:[],CANCELLED:[]};
export function assertVacancyTransition(from:VacancyStatus,to:VacancyStatus){if(!transitions[from].includes(to))throw new ApplicationError(`No se puede cambiar una vacante de ${from} a ${to}.`,"INVALID_STATUS_TRANSITION",409)}
