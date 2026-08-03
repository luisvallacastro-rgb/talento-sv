ALTER TABLE "memberships" ADD COLUMN "last_access_at" TIMESTAMPTZ(6);

CREATE TABLE "sessions" (
  "id" BIGSERIAL PRIMARY KEY,
  "public_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL,
  "user_id" BIGINT NOT NULL,
  "tenant_id" BIGINT NOT NULL,
  "membership_id" BIGINT NOT NULL,
  "user_agent" TEXT,
  "ip_address" INET,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "sessions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "sessions_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "sessions_public_id_key" ON "sessions"("public_id");
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");
CREATE INDEX "sessions_user_id_revoked_at_idx" ON "sessions"("user_id", "revoked_at");
CREATE INDEX "sessions_tenant_id_expires_at_idx" ON "sessions"("tenant_id", "expires_at");

CREATE TABLE "login_attempts" (
  "id" BIGSERIAL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "ip_address" INET,
  "successful" BOOLEAN NOT NULL,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "login_attempts_email_occurred_at_idx" ON "login_attempts"("email", "occurred_at");
CREATE INDEX "login_attempts_ip_address_occurred_at_idx" ON "login_attempts"("ip_address", "occurred_at");

CREATE TABLE "invitations" (
  "id" BIGSERIAL PRIMARY KEY,
  "public_id" UUID NOT NULL,
  "tenant_id" BIGINT NOT NULL,
  "email" TEXT NOT NULL,
  "token_hash" TEXT NOT NULL,
  "created_by_id" BIGINT NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "accepted_at" TIMESTAMPTZ(6),
  "revoked_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invitations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "invitations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX "invitations_public_id_key" ON "invitations"("public_id");
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "invitations"("token_hash");
CREATE INDEX "invitations_tenant_id_email_idx" ON "invitations"("tenant_id", "email");
