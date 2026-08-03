import { getCurrentSession, type CurrentSession } from "@/modules/identity/infrastructure/current-session";
import { requirePermission } from "@/modules/authorization/domain/access-context";
import { ApplicationError } from "@/shared/domain/errors/application-error";

export async function authorized(permission: string): Promise<CurrentSession> {
  const context = await getCurrentSession();
  if (!context) throw new ApplicationError("Debe iniciar sesión.", "UNAUTHENTICATED", 401);
  requirePermission(context, permission);
  return context;
}
