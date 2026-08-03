import { ApplicationError } from "@/shared/domain/errors/application-error";

export type AccessContext = {
  userId: bigint;
  tenantId: bigint;
  membershipId: bigint;
  permissions: ReadonlySet<string>;
};

export function requirePermission(context: AccessContext, permission: string): void {
  if (!context.permissions.has(permission)) {
    throw new ApplicationError("No tiene permiso para realizar esta acción.", "FORBIDDEN", 403);
  }
}

export function assertTenantScope(context: AccessContext, resourceTenantId: bigint): void {
  if (context.tenantId !== resourceTenantId && !context.permissions.has("platform.manage")) {
    throw new ApplicationError("El recurso no existe o no está disponible.", "NOT_FOUND", 404);
  }
}
