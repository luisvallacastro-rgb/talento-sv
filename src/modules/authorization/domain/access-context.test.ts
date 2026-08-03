import assert from "node:assert/strict";
import test from "node:test";
import { assertTenantScope, requirePermission, type AccessContext } from "./access-context";
import { ApplicationError } from "@/shared/domain/errors/application-error";

const context = (permissions: string[] = []): AccessContext => ({ userId: 1n, tenantId: 10n, membershipId: 100n, permissions: new Set(permissions) });

test("permite una capacidad asignada", () => assert.doesNotThrow(() => requirePermission(context(["vacancies.manage"]), "vacancies.manage")));
test("rechaza una capacidad no asignada", () => assert.throws(() => requirePermission(context(), "vacancies.manage"), (error: unknown) => error instanceof ApplicationError && error.statusCode === 403));
test("permite recursos de la empresa activa", () => assert.doesNotThrow(() => assertTenantScope(context(), 10n)));
test("oculta recursos de otra empresa", () => assert.throws(() => assertTenantScope(context(), 20n), (error: unknown) => error instanceof ApplicationError && error.statusCode === 404));
test("superadministración puede atravesar empresas", () => assert.doesNotThrow(() => assertTenantScope(context(["platform.manage"]), 20n)));
