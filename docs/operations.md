# Operación, respaldo y recuperación

## Respaldo

- PostgreSQL: respaldo completo diario cifrado, WAL continuo cuando el proveedor lo permita y retención definida por la política legal aprobada.
- Objetos S3: versionado, cifrado, bloqueo de acceso público y reglas de ciclo de vida coherentes con la retención del expediente.
- Secretos y configuración: respaldar únicamente desde el gestor de secretos; nunca incluir `.env` en repositorios o copias compartidas.
- Objetivos iniciales que deben aprobarse: RPO de 24 horas y RTO de 8 horas. Para operación crítica, reducirlos con WAL y réplica administrada.

Ejemplo de respaldo lógico, ejecutado por infraestructura con credenciales inyectadas:

```bash
pg_dump --format=custom --no-owner --file=talento.dump "$DATABASE_URL"
```

## Restauración

1. Crear una base aislada con la misma versión mayor de PostgreSQL.
2. Restaurar con `pg_restore --clean --if-exists --no-owner`.
3. Ejecutar `prisma migrate status`; no aplicar migraciones nuevas hasta validar la copia.
4. Verificar conteos por empresa, usuarios, vacantes, candidatos, auditoría y referencias de objetos.
5. Comprobar una muestra de descargas S3 sin exponer datos a usuarios no autorizados.
6. Ejecutar pruebas de aislamiento, scoring y login.
7. Documentar resultado, duración, RPO real y aprobador antes del cambio de tráfico.

La restauración debe ensayarse trimestralmente. Un respaldo no probado no se considera recuperable.

## Mantenimiento

- Revocar sesiones expiradas y depurar intentos de acceso según retención.
- Invocar `POST /api/internal/workers/email-outbox` con `x-worker-secret` desde un cron cada minuto. El worker usa bloqueo recuperable, clave de idempotencia y reintento exponencial; marca `processed_at` y elimina del payload los enlaces con token únicamente después de una entrega confirmada.
- Alertar por acumulación del outbox, errores 5xx, intentos bloqueados, cambios de permisos y accesos a documentos.
- Analizar archivos con antivirus antes de cambiar `PENDING` a `AVAILABLE` en producción.
- Revisar índices y consultas lentas con datos de volumen real.
