-- Run this script in the Supabase SQL Editor to create the push_subscriptions table

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(endpoint)
);

-- Add index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions (user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public select" ON public.push_subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public update" ON public.push_subscriptions
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete" ON public.push_subscriptions
  FOR DELETE
  USING (true);
