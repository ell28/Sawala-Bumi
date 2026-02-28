import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

/*
SQL Schema Reference:

CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  booking_slot TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 90,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','EXPIRED','COMPLETED','CANCELLED')),
  questionnaire_data JSONB,
  xendit_invoice_id TEXT,
  xendit_invoice_url TEXT,
  google_event_id TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX idx_bookings_slot ON bookings (booking_slot);
CREATE INDEX idx_bookings_status ON bookings (status);

-- RLS: allow anon to insert & read bookings (for MVP)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON bookings FOR SELECT USING (true);
*/
