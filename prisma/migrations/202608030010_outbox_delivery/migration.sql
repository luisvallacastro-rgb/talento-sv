ALTER TABLE "outbox_events" ADD COLUMN "locked_at" TIMESTAMPTZ(6),ADD COLUMN "last_error" TEXT;
CREATE INDEX "outbox_events_processed_at_locked_at_idx" ON "outbox_events"("processed_at","locked_at");
