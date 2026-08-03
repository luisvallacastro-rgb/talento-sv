import assert from "node:assert/strict";import test from "node:test";import { isAllowedOrigin } from "./origin";
test("acepta solicitudes del mismo origen",()=>assert.equal(isAllowedOrigin("https://talento.example","https://talento.example/api/test"),true));
test("rechaza solicitudes de otro origen",()=>assert.equal(isAllowedOrigin("https://evil.example","https://talento.example/api/test"),false));
test("acepta localhost y 127.0.0.1 como el mismo origen local",()=>assert.equal(isAllowedOrigin("http://127.0.0.1:3000","http://localhost:3000/api/login"),true));
