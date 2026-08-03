# Talento SV

Base de una plataforma SaaS multiempresa para reclutamiento y selección en El Salvador. Incluye la fundación técnica, el backend de identidad y autorización, y el sitio corporativo público.

## Requisitos

- Node.js 22 y pnpm 11
- Docker con Compose

## Inicio local

```bash
cp .env.example .env
docker compose up -d postgres
pnpm install
pnpm db:generate
pnpm db:migrate --name init
pnpm db:seed
pnpm dev
```

Abrir `http://localhost:3000`; el diagnóstico está en `http://localhost:3000/api/health`.

## Validación

```bash
pnpm typecheck
pnpm test
pnpm build
```

La verificación integral crea una base PostgreSQL desechable en el puerto `55432`, aplica todas las migraciones, ejecuta el seed, comprueba que no exista deriva de esquema y finalmente corre tipos, pruebas y build:

```bash
pnpm verify:integration
```

Requiere Docker. El contenedor y su volumen temporal se eliminan automáticamente al terminar.

El mismo proceso se ejecuta automáticamente en GitHub Actions para cambios a `main` y pull requests. Incluye una prueba de seed, roles, quince etapas y unicidad de candidatos dentro de cada empresa.

Para orquestadores y balanceadores:

- `/api/health` indica que el proceso web está vivo.
- `/api/health/readiness` comprueba además la conexión con PostgreSQL y responde `503` cuando la aplicación no debe recibir tráfico.

## Alcance y documentación

El diseño funcional, módulos, ER, tablas, relaciones, estrategia multiempresa, roles, flujos, seguridad, riesgos, plan y puntos legales están en [docs/architecture.md](docs/architecture.md).

## Estado

Fases 1 y 2 implementadas en su alcance backend. La Fase 2 incluye inicio/cierre de sesión, recuperación y cambio de contraseña, sesiones activas revocables, bloqueo temporal, invitaciones, membresías, empresas, usuarios, roles/permisos, auditoría y entrega transaccional de correos mediante outbox. La interfaz administrativa se construirá junto con los portales privados, sin debilitar la autorización del servidor.

Fase 3 implementada: sitio corporativo responsivo, servicios, evaluaciones, selección por competencias, vacantes públicas, formularios de contacto, cotización, solicitud de personal y recepción inicial de perfiles. Los formularios incluyen validación en servidor, honeypot, tiempo mínimo y límite por correo/IP. La carga binaria de currículos queda pendiente de configurar el almacenamiento S3 privado; por ahora se admite un enlace privado al archivo.

Fase 4 implementada en su alcance backend: solicitudes estructuradas; creación, edición, duplicación, asignación y transiciones de vacantes; expedientes con experiencia, formación, certificaciones, idiomas, competencias, referencias, etiquetas y consentimientos; postulaciones y etapas configurables; entrevistas con formularios versionados; y documentos privados mediante URLs firmadas S3. Antes de producción faltan ejecutar pruebas de integración contra una instancia PostgreSQL y conectar análisis antivirus en la transición de documento pendiente a disponible.

Fase 5 implementada en su alcance backend: evaluaciones parametrizables con confirmación de uso autorizado, versiones e interpretación profesional; matrices de scoring inmutables y versionadas; pesos validados al 100%; reglas excluyentes, bonificaciones y penalizaciones; ejecuciones reproducibles con componentes explicables; ranking por última ejecución válida; y ternas con selección humana, motivos, publicación y auditoría.

Fase 6 implementada: portal ejecutivo diferenciado por rol, resumen de procesos propios, métricas, línea de tiempo, candidatos exclusivamente presentados, comparación visual de ternas, scoring autorizado, decisiones del cliente, favoritos, solicitudes de entrevista, comentarios visibles e informe ejecutivo descargable e imprimible. Las consultas de cliente exigen simultáneamente `client_tenant_id` y `presented_to_client_at`.

Fase 7 implementada en su núcleo: notificaciones internas, plantillas de correo versionables, indicadores operativos por período, cabeceras de seguridad, verificación de origen para mutaciones, identificadores de solicitud, pruebas ampliadas y procedimientos de respaldo/restauración. El envío real de correo, antivirus y monitoreo requieren proveedores externos antes de producción.

El correo de invitación y recuperación se entrega mediante un webhook configurable. Un cron debe invocar `POST /api/internal/workers/email-outbox` con `x-worker-secret`. El worker bloquea eventos concurrentes, reintenta con espera exponencial, usa claves de idempotencia y elimina los enlaces con token después de confirmar la entrega.

Para crear el administrador inicial, establezca una contraseña segura en `SEED_ADMIN_PASSWORD` antes de ejecutar el seed. No existe una contraseña predeterminada.
