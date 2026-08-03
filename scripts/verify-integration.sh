#!/bin/sh
set -eu

PROJECT_NAME="talento-integration"
COMPOSE_FILE="docker-compose.integration.yml"
export DATABASE_URL="postgresql://talento_test:talento_test_only@localhost:55432/talento_integration?schema=public"
export AUTH_SECRET="integration-only-secret-with-more-than-32-characters"
export SEED_ADMIN_EMAIL="integration-admin@talento.local"
export SEED_ADMIN_PASSWORD="Integration-Only-2026"

cleanup() {
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" down --volumes
}
trap cleanup EXIT INT TERM

docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --wait
pnpm exec prisma migrate deploy
pnpm db:seed
pnpm exec tsx scripts/integration-check.ts
pnpm exec prisma migrate status
pnpm exec prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --exit-code
pnpm typecheck
pnpm test
pnpm build
