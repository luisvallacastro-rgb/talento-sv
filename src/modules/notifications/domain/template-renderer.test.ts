import assert from "node:assert/strict";import test from "node:test";import { renderTemplate } from "./template-renderer";
test("renderiza todas las variables autorizadas",()=>assert.equal(renderTemplate("Hola {{ name }}, proceso {{process}}.",{name:"Ana",process:"Contabilidad"}),"Hola Ana, proceso Contabilidad."));
test("rechaza plantillas con variables ausentes",()=>assert.throws(()=>renderTemplate("Hola {{name}}",{}),/name/));
