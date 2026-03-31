-- ============================================
-- Supabase Database Schema — Edizioni Duepuntozero Pricing
-- ============================================

-- 1. Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  phone           TEXT,
  company_name    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Quotes (wizard submissions / leads)
CREATE TABLE public.quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'new'
                  CHECK (status IN ('new','contacted','in_progress','quoted','accepted','rejected','archived')),
  -- Package selection
  service_id      TEXT NOT NULL,
  service_name    TEXT NOT NULL,
  tier_key        TEXT NOT NULL,
  tier_name       TEXT NOT NULL,
  tier_price      INTEGER NOT NULL,
  add_ons         JSONB DEFAULT '[]',
  features        JSONB DEFAULT '[]',
  -- AI form data
  business_name   TEXT,
  sector          TEXT,
  style           TEXT,
  color_palette   TEXT[] DEFAULT '{}',
  description     TEXT,
  reference_urls  TEXT,
  -- Contact info (for anonymous leads)
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  contact_message TEXT,
  -- Computed totals
  total_one_time  INTEGER DEFAULT 0,
  total_monthly   INTEGER DEFAULT 0,
  -- Metadata
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quotes_created_at ON public.quotes(created_at DESC);

-- 3. Previews (AI-generated mockup images)
CREATE TABLE public.previews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id        UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  storage_path    TEXT NOT NULL,
  prompt_hash     TEXT,
  prompt_input    JSONB,
  file_size_bytes INTEGER,
  mime_type       TEXT DEFAULT 'image/png',
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.previews ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_previews_user_id ON public.previews(user_id);
CREATE INDEX idx_previews_quote_id ON public.previews(quote_id);

-- 4. Rate Limits (persistent rate limiting)
CREATE TABLE public.rate_limits (
  id              BIGSERIAL PRIMARY KEY,
  key             TEXT NOT NULL,
  action          TEXT NOT NULL,
  window_start    TIMESTAMPTZ NOT NULL,
  count           INTEGER DEFAULT 1,
  UNIQUE(key, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rate_limits_lookup ON public.rate_limits(key, action, window_start);

-- Atomic check-and-increment RPC function
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key TEXT,
  p_action TEXT,
  p_max_count INTEGER,
  p_window_interval INTERVAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
BEGIN
  v_window_start := date_trunc('hour', now());

  INSERT INTO public.rate_limits (key, action, window_start, count)
  VALUES (p_key, p_action, v_window_start, 1)
  ON CONFLICT (key, action, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_current_count;

  RETURN v_current_count <= p_max_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Quotes
CREATE POLICY "Users can view own quotes"
  ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quotes"
  ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access on quotes"
  ON public.quotes FOR ALL USING (auth.role() = 'service_role');

-- Previews
CREATE POLICY "Users can view own previews"
  ON public.previews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on previews"
  ON public.previews FOR ALL USING (auth.role() = 'service_role');

-- Rate Limits (service role only)
CREATE POLICY "Service role only on rate_limits"
  ON public.rate_limits FOR ALL USING (auth.role() = 'service_role');
