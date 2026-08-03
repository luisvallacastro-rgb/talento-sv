import { PrismaClient, TenantType } from "@prisma/client";
import { hashPassword } from "../src/modules/identity/domain/password";

const prisma = new PrismaClient();
const password = process.env.DEMO_CLIENT_PASSWORD ?? "ClienteDemo2026!";

async function main() {
  const recruiter = await prisma.tenant.upsert({ where: { slug: "talento-sv" }, update: {}, create: { name: "Talento SV", slug: "talento-sv", type: TenantType.RECRUITER } });
  const client = await prisma.tenant.upsert({ where: { slug: "grupo-horizonte" }, update: { name: "Grupo Horizonte", active: true }, create: { name: "Grupo Horizonte", slug: "grupo-horizonte", type: TenantType.CLIENT } });
  const user = await prisma.user.upsert({ where: { email: "cliente@grupohorizonte.demo" }, update: { displayName: "María Fernández", passwordHash: await hashPassword(password), active: true, mustChangePassword: false }, create: { email: "cliente@grupohorizonte.demo", displayName: "María Fernández", passwordHash: await hashPassword(password) } });
  const membership = await prisma.membership.upsert({ where: { tenantId_userId: { tenantId: client.id, userId: user.id } }, update: { status: "ACTIVE" }, create: { tenantId: client.id, userId: user.id, status: "ACTIVE" } });
  const role = await prisma.role.upsert({ where: { tenantId_code: { tenantId: client.id, code: "client" } }, update: { name: "Cliente" }, create: { tenantId: client.id, code: "client", name: "Cliente", system: true } });
  const permissions = await prisma.permission.findMany({ where: { code: { in: ["vacancies.read.own", "candidates.read.presented"] } } });
  for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
  await prisma.membershipRole.upsert({ where: { membershipId_roleId: { membershipId: membership.id, roleId: role.id } }, update: {}, create: { membershipId: membership.id, roleId: role.id } });

  const vacancy = await prisma.vacancy.upsert({ where: { ownerTenantId_slug: { ownerTenantId: recruiter.id, slug: "direccion-operaciones-demo" } }, update: { clientTenantId: client.id, status: "PUBLISHED", deletedAt: null }, create: { ownerTenantId: recruiter.id, clientTenantId: client.id, title: "Dirección de Operaciones", slug: "direccion-operaciones-demo", summary: "Liderar operaciones regionales, eficiencia y crecimiento del equipo.", location: "San Salvador", workMode: "Híbrido", status: "PUBLISHED", targetDate: new Date("2026-09-15") } });
  if (!await prisma.vacancyStatusHistory.findFirst({ where: { vacancyId: vacancy.id } })) await prisma.vacancyStatusHistory.create({ data: { vacancyId: vacancy.id, toStatus: "PUBLISHED", changedById: user.id, reason: "Proceso de demostración activo" } });

  const matrix = await prisma.scoringMatrix.upsert({ where: { tenantId_name: { tenantId: recruiter.id, name: "Afinidad ejecutiva demo" } }, update: {}, create: { tenantId: recruiter.id, name: "Afinidad ejecutiva demo" } });
  const version = await prisma.scoringMatrixVersion.upsert({ where: { matrixId_version: { matrixId: matrix.id, version: 1 } }, update: { publishedAt: new Date() }, create: { matrixId: matrix.id, version: 1, publishedAt: new Date() } });
  await prisma.vacancy.update({ where: { id: vacancy.id }, data: { scoringVersionId: version.id } });

  const people = [
    { first: "Laura", last: "Ramírez", email: "laura.ramirez@demo.test", company: "Logística Centroamericana", position: "Gerente de Operaciones", degree: "Ingeniería Industrial", score: 92, competencies: ["Liderazgo", "Estrategia", "Optimización de procesos"] },
    { first: "Andrés", last: "Molina", email: "andres.molina@demo.test", company: "Grupo Distribuidor", position: "Director Regional", degree: "MBA", score: 90, competencies: ["Gestión regional", "Negociación", "Analítica"] },
    { first: "Julia", last: "Reyes", email: "julia.reyes@demo.test", company: "Operaciones del Pacífico", position: "Head of Operations", degree: "Administración de Empresas", score: 88, competencies: ["Cultura de equipo", "Eficiencia", "Transformación"] },
  ];
  const applications = [];
  for (const [index, person] of people.entries()) {
    const candidate = await prisma.candidate.upsert({ where: { tenantId_email: { tenantId: recruiter.id, email: person.email } }, update: { firstName: person.first, lastName: person.last, deletedAt: null }, create: { tenantId: recruiter.id, firstName: person.first, lastName: person.last, email: person.email } });
    await prisma.candidateExperience.deleteMany({ where: { candidateId: candidate.id } });
    await prisma.candidateEducation.deleteMany({ where: { candidateId: candidate.id } });
    await prisma.candidateCompetency.deleteMany({ where: { candidateId: candidate.id } });
    await prisma.candidateExperience.create({ data: { candidateId: candidate.id, company: person.company, position: person.position, startedOn: new Date("2021-01-01"), description: "Liderazgo de equipos, indicadores y mejora continua." } });
    await prisma.candidateEducation.create({ data: { candidateId: candidate.id, institution: "Universidad Centroamericana", degree: person.degree, completedOn: new Date("2018-11-01") } });
    await prisma.candidateCompetency.createMany({ data: person.competencies.map(name => ({ candidateId: candidate.id, name, level: "Avanzado" })) });
    const application = await prisma.application.upsert({ where: { vacancyId_candidateId: { vacancyId: vacancy.id, candidateId: candidate.id } }, update: { status: "SHORTLISTED", presentedToClientAt: new Date() }, create: { vacancyId: vacancy.id, candidateId: candidate.id, status: "SHORTLISTED", presentedToClientAt: new Date() } });
    await prisma.scoreRun.deleteMany({ where: { applicationId: application.id } });
    await prisma.scoreRun.create({ data: { applicationId: application.id, versionId: version.id, inputs: { experiencia: true, liderazgo: true }, total: person.score, explanation: { resumen: "Afinidad calculada y validada por especialista." } } });
    applications.push({ id: application.id, position: index + 1, reason: `${person.score}% de afinidad y experiencia relevante.` });
  }
  let shortlist = await prisma.shortlist.findFirst({ where: { vacancyId: vacancy.id, status: "PUBLISHED" } });
  if (!shortlist) shortlist = await prisma.shortlist.create({ data: { vacancyId: vacancy.id, status: "PUBLISHED", targetSize: 3, presentedAt: new Date() } });
  await prisma.shortlistEntry.deleteMany({ where: { shortlistId: shortlist.id } });
  await prisma.shortlistEntry.createMany({ data: applications.map(a => ({ shortlistId: shortlist!.id, applicationId: a.id, position: a.position, inclusionReason: a.reason })) });
  if (!await prisma.processComment.findFirst({ where: { vacancyId: vacancy.id, visibility: "CLIENT" } })) await prisma.processComment.create({ data: { tenantId: client.id, vacancyId: vacancy.id, authorUserId: user.id, visibility: "CLIENT", body: "La terna está lista para revisión. Puede comparar perfiles, marcar favoritos y solicitar entrevistas." } });
  console.log(JSON.stringify({ tenantSlug: client.slug, email: user.email, password, process: vacancy.title }, null, 2));
}

main().finally(async () => prisma.$disconnect());
