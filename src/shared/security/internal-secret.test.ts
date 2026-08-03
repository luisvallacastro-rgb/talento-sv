import assert from "node:assert/strict";import test from "node:test";import { verifyInternalSecret } from "./internal-secret";
test("acepta el secreto interno exacto",()=>assert.equal(verifyInternalSecret("secret-123","secret-123"),true));
test("rechaza secretos diferentes o ausentes",()=>{assert.equal(verifyInternalSecret("secret-124","secret-123"),false);assert.equal(verifyInternalSecret(null,"secret-123"),false)});
