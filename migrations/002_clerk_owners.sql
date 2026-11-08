BEGIN;
-- Keep old auth tables intact. Copy the profile IDs before moving the ledger FK.
DO $$
BEGIN
  IF to_regclass('public."user"') IS NOT NULL THEN
    INSERT INTO veyra_users(id,email,name,created_at)
      SELECT id, lower(email), name, "createdAt" FROM "user"
      ON CONFLICT(id) DO NOTHING;
  END IF;
END $$;
ALTER TABLE veyra_invoice_records DROP CONSTRAINT IF EXISTS veyra_invoice_records_owner_id_fkey;
ALTER TABLE veyra_invoice_records ADD CONSTRAINT veyra_invoice_records_owner_id_fkey
  FOREIGN KEY(owner_id) REFERENCES veyra_users(id) ON DELETE CASCADE;
COMMIT;
