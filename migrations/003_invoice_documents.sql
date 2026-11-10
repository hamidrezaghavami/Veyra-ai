CREATE TABLE IF NOT EXISTS veyra_invoice_documents (
  invoice_id UUID PRIMARY KEY REFERENCES veyra_invoice_records(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES veyra_users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('application/pdf','image/png','image/jpeg','image/webp','application/json')),
  data BYTEA NOT NULL CHECK (octet_length(data) BETWEEN 1 AND 2800000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
