import assert from "node:assert/strict";
import { PrismaClient, TenantType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const recruiter = await prisma.tenant.findUniqueOrThrow({ where: { slug: "talento-sv" } });
  const stages = await prisma.pipelineStage.count({ where: { tenantId: recruiter.id, active: true } });
  assert.equal(stages, 15, "El seed debe crear las quince etapas configurables");

  const permissions = await prisma.permission.count();
  assert.ok(permissions >= 9, "El catálogo inicial de permisos está incompleto");

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  if (adminEmail) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: adminEmail.toLowerCase() }, include: { memberships: { where: { tenantId: recruiter.id }, include: { roles: true } } } });
    assert.equal(admin.memberships[0]?.status, "ACTIVE");
    assert.ok((admin.memberships[0]?.roles.length ?? 0) > 0, "El administrador inicial debe tener al menos un rol");
  }

  const suffix = Date.now().toString(36);
  const [firstTenant, secondTenant] = await Promise.all([
    prisma.tenant.create({ data: { name: `Cliente A ${suffix}`, slug: `client-a-${suffix}`, type: TenantType.CLIENT } }),
    prisma.tenant.create({ data: { name: `Cliente B ${suffix}`, slug: `client-b-${suffix}`, type: TenantType.CLIENT } }),
  ]);
  const sharedEmail = `candidate-${suffix}@example.test`;
  await prisma.candidate.create({ data: { tenantId: firstTenant.id, firstName: "Ana", lastName: "Prueba", email: sharedEmail } });
  await prisma.candidate.create({ data: { tenantId: secondTenant.id, firstName: "Ana", lastName: "Prueba", email: sharedEmail } });
  await assert.rejects(() => prisma.candidate.create({ data: { tenantId: firstTenant.id, firstName: "Duplicada", lastName: "Prueba", email: sharedEmail } }), "El mismo correo no debe duplicarse dentro de una empresa");

  await prisma.candidate.deleteMany({ where: { tenantId: { in: [firstTenant.id, secondTenant.id] } } });
  await prisma.tenant.deleteMany({ where: { id: { in: [firstTenant.id, secondTenant.id] } } });
}

main().finally(async () => prisma.$disconnect());
