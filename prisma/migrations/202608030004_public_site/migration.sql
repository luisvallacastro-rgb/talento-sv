CREATE TYPE "PublicInquiryType" AS ENUM ('CONTACT', 'QUOTE', 'STAFF_REQUEST', 'RESUME');
ALTER TABLE "vacancies" ADD COLUMN "slug" TEXT, ADD COLUMN "public" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "summary" TEXT, ADD COLUMN "location" TEXT, ADD COLUMN "work_mode" TEXT;
CREATE UNIQUE INDEX "vacancies_owner_tenant_id_slug_key" ON "vacancies"("owner_tenant_id", "slug");
CREATE INDEX "vacancies_public_status_created_at_idx" ON "vacancies"("public", "status", "created_at");
CREATE TABLE "public_inquiries" (
  "id" BIGSERIAL PRIMARY KEY,
  "public_id" UUID NOT NULL,
  "type" "PublicInquiryType" NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "company" TEXT,
  "payload" JSONB NOT NULL,
  "ip_hash" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMPTZ(6)
);
CREATE UNIQUE INDEX "public_inquiries_public_id_key" ON "public_inquiries"("public_id");
CREATE INDEX "public_inquiries_type_created_at_idx" ON "public_inquiries"("type", "created_at");
CREATE INDEX "public_inquiries_email_created_at_idx" ON "public_inquiries"("email", "created_at");
