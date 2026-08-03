import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./password";

test("las contraseñas se almacenan con salt y se verifican", async () => {
  const first = await hashPassword("Una-clave-segura-2026");
  const second = await hashPassword("Una-clave-segura-2026");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("Una-clave-segura-2026", first), true);
  assert.equal(await verifyPassword("incorrecta", first), false);
});
