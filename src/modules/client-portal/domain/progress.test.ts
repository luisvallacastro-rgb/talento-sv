import assert from "node:assert/strict";import test from "node:test";import { calculateProgress } from "./progress";
test("un proceso activo nunca se presenta falsamente como completo",()=>assert.equal(calculateProgress(15,15,false),99));
test("un proceso cerrado se presenta al cien por ciento",()=>assert.equal(calculateProgress(15,15,true),100));
