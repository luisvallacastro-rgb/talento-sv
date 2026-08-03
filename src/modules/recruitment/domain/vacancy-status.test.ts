import assert from "node:assert/strict";import test from "node:test";import { assertVacancyTransition } from "./vacancy-status";import { ApplicationError } from "@/shared/domain/errors/application-error";
test("permite publicar una vacante revisada",()=>assert.doesNotThrow(()=>assertVacancyTransition("REVIEW","PUBLISHED")));
test("impide reabrir silenciosamente una vacante cerrada",()=>assert.throws(()=>assertVacancyTransition("CLOSED","PUBLISHED"),(e:unknown)=>e instanceof ApplicationError&&e.statusCode===409));
