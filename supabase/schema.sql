-- ============================================================
-- Pencatat Keuangan - Complete Database Schema
-- Jalankan SELURUH script ini di Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABEL EXPENSES (Pengeluaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  category    TEXT NOT NULL DEFAULT 'lainnya',
  date        DATE NOT NULL,
  note        TEXT,
  receipt_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date    ON expenses (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (user_id, category);

-- ============================================================
-- 2. TABEL INCOMES (Pemasukan)
-- ============================================================
CREATE TABLE IF NOT EXISTS incomes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  category    TEXT NOT NULL DEFAULT 'lainnya_in',
  date        DATE NOT NULL,
  note        TEXT,
  receipt_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes (user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date    ON incomes (user_id, date DESC);

-- ============================================================
-- 3. TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expenses_updated_at ON expenses;
CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS incomes_updated_at ON incomes;
CREATE TRIGGER incomes_updated_at
  BEFORE UPDATE ON incomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) — Isolasi data per user
-- ============================================================

-- Expenses RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for demo"            ON expenses;
DROP POLICY IF EXISTS "Users can view own expenses"   ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Incomes RLS
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own incomes"   ON incomes;
DROP POLICY IF EXISTS "Users can insert own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can update own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can delete own incomes" ON incomes;

CREATE POLICY "Users can view own incomes"
  ON incomes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes"
  ON incomes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes"
  ON incomes FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes"
  ON incomes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 5. STORAGE BUCKET untuk foto struk & bukti
-- ============================================================
-- Buat bucket 'receipts' di Supabase Dashboard:
--   Storage → New Bucket → nama: receipts → Public: ON
--
-- Lalu jalankan SQL berikut untuk storage policies:

-- CREATE POLICY "Users can upload own receipts"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'receipts' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- CREATE POLICY "Public can read receipts"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'receipts');
--
-- CREATE POLICY "Users can delete own receipts"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'receipts' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- ============================================================
-- SELESAI. Database siap digunakan.
-- ============================================================
