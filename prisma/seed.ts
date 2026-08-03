import { PrismaClient, TenantType } from "@prisma/client";
import { hashPassword } from "../src/modules/identity/domain/password";

const prisma = new PrismaClient();

const permissions = [
  ["platform.manage", "Administrar plataforma"],
  ["users.manage", "Administrar usuarios"],
  ["roles.manage", "Administrar roles y permisos"],
  ["vacancies.manage", "Administrar vacantes"],
  ["vacancies.read.own", "Consultar vacantes propias"],
  ["candidates.manage", "Administrar candidatos"],
  ["candidates.read.presented", "Consultar candidatos presentados"],
  ["assessments.manage", "Administrar evaluaciones"],
  ["audit.read", "Consultar auditoría"],
] as const;

const stages = ["Solicitud recibida", "Perfil validado", "Publicación", "Recepción", "Filtrado curricular", "Preselección", "Entrevistas", "Evaluaciones", "Referencias", "Elaboración de terna", "Presentación al cliente", "Entrevista con cliente", "Selección", "Contratación", "Cierre"];

const rolePermissions: Record<string, string[]> = {
  recruiter_admin: ["users.manage", "roles.manage", "vacancies.manage", "vacancies.read.own", "candidates.manage", "candidates.read.presented", "assessments.manage", "audit.read"],
  recruiter: ["vacancies.manage", "vacancies.read.own", "candidates.manage"],
  psychologist: ["vacancies.read.own", "candidates.manage", "assessments.manage"],
  client: ["vacancies.read.own", "candidates.read.presented"],
  candidate: [],
};

async function main() {
  const recruiter = await prisma.tenant.upsert({
    where: { slug: "talento-sv" },
    update: {},
    create: { name: "Talento SV", slug: "talento-sv", type: TenantType.RECRUITER },
  });
  for (const [code, name] of permissions) {
    await prisma.permission.upsert({ where: { code }, update: { name }, create: { code, name } });
  }
  for (const [code, permissionCodes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { tenantId_code: { tenantId: recruiter.id, code } },
      update: { name: code.replaceAll("_", " ") },
      create: { tenantId: recruiter.id, code, name: code.replaceAll("_", " "), system: true },
    });
    const assigned = await prisma.permission.findMany({ where: { code: { in: permissionCodes } }, select: { id: true } });
    await prisma.rolePermission.createMany({ data: assigned.map(({ id }) => ({ roleId: role.id, permissionId: id })), skipDuplicates: true });
  }
  for (const [position, name] of stages.entries()) {
    const code = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    await prisma.pipelineStage.upsert({
      where: { tenantId_code: { tenantId: recruiter.id, code } },
      update: { name, position: position + 1 },
      create: { tenantId: recruiter.id, code, name, position: position + 1 },
    });
  }
  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (seedPassword) {
    const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@talento.local").toLowerCase();
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, displayName: "Administrador inicial", passwordHash: await hashPassword(seedPassword) },
    });
    const membership = await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: recruiter.id, userId: user.id } },
      update: { status: "ACTIVE" },
      create: { tenantId: recruiter.id, userId: user.id, status: "ACTIVE" },
    });
    const adminRole = await prisma.role.findUniqueOrThrow({ where: { tenantId_code: { tenantId: recruiter.id, code: "recruiter_admin" } } });
    await prisma.membershipRole.upsert({ where: { membershipId_roleId: { membershipId: membership.id, roleId: adminRole.id } }, update: {}, create: { membershipId: membership.id, roleId: adminRole.id } });
  }
}

main().finally(async () => prisma.$disconnect());
