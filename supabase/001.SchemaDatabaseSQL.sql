-- ============================================================================
-- SESI 1: DATABASE SCHEMA & SECURITY POLICIES (SUPABASE POSTGRESQL)
-- ============================================================================

-- 1. TABEL: PROFILES (Profil Pengguna & Preferensi Trading)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP WITH TIME ZONE,
    default_capital NUMERIC DEFAULT 100000000,   -- Modal default Rp 100 Juta
    risk_percentage NUMERIC DEFAULT 1.0,          -- Resiko default 1% per trade
    buy_fee_percent NUMERIC DEFAULT 0.15,        -- Fee beli sekuritas 0.15%
    sell_fee_percent NUMERIC DEFAULT 0.25,       -- Fee jual sekuritas 0.25%
    virtual_balance NUMERIC DEFAULT 100000000,   -- Modal tunai simulasi Rp 100 Juta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL: STOCKS (Master Pool Emiten Bersama)
CREATE TABLE public.stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT UNIQUE NOT NULL,                 -- e.g., 'BBCA.JK'
    ticker TEXT NOT NULL,                        -- e.g., 'BBCA'
    name TEXT NOT NULL,                          -- Nama Emiten
    sector TEXT,                                 -- Sektor industri
    is_syariah BOOLEAN DEFAULT FALSE,            -- Masuk Daftar Efek Syariah (DES)
    index_tags TEXT[] DEFAULT '{}',              -- e.g., ARRAY['LQ45', 'IDX30']
    is_liquid BOOLEAN DEFAULT TRUE,              -- Transaksi likuid harian
    is_active BOOLEAN DEFAULT TRUE,              -- TRUE jika ada minimal 1 user yang memantau
    last_bow_score NUMERIC DEFAULT 0,            -- Skor algoritma Buy on Weakness (0-100)
    last_close NUMERIC,                          -- Harga penutupan terakhir
    suggested_entry NUMERIC,                     -- Saran harga masuk
    suggested_sl NUMERIC,                        -- Saran Stop Loss (Swing Low)
    suggested_tp NUMERIC,                        -- Target Resisten / TP
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL: STOCK_CANDLES (Histori Candle EOD untuk Chart & Indikator)
CREATE TABLE public.stock_candles (
    id BIGSERIAL PRIMARY KEY,
    stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
    time DATE NOT NULL,
    open NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL,
    volume BIGINT NOT NULL,
    UNIQUE(stock_id, time)
);
CREATE INDEX idx_stock_candles_lookup ON public.stock_candles(stock_id, time DESC);

-- 4. TABEL: USER_UNIVERSE (Watchlist Semesta Saham Milik Masing-masing User)
CREATE TABLE public.user_universe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stock_id)
);

-- 5. TABEL: SIM_POSITIONS (Portofolio Saham yang Sedang Dipegang di Simulasi)
CREATE TABLE public.sim_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
    lots INTEGER NOT NULL CHECK (lots > 0),
    avg_buy_price NUMERIC NOT NULL,
    target_sl NUMERIC,
    target_tp NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stock_id)
);

-- 6. TABEL: SIM_TRANSACTIONS (Jurnal Riwayat Beli/Jual Simulasi)
CREATE TABLE public.sim_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id REFERENCES public.profiles(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
    price NUMERIC NOT NULL,
    lots INTEGER NOT NULL CHECK (lots > 0),
    fee_amount NUMERIC NOT NULL,
    realized_pnl NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - KEAMANAN DATA
-- ============================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_universe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_transactions ENABLE ROW LEVEL SECURITY;

-- Policy Profiles: User hanya bisa membaca & mengedit profil miliknya sendiri
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policy Stocks & Candles: Seluruh user terotentikasi bisa membaca (Data Bersama)
CREATE POLICY "Authenticated users can read stocks" 
ON public.stocks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read candles" 
ON public.stock_candles FOR SELECT TO authenticated USING (true);

-- Policy User Universe: User hanya bisa kelola watchlist miliknya
CREATE POLICY "Users can manage own universe" 
ON public.user_universe FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Policy Simulation: Isolasi penuh akun simulasi per user
CREATE POLICY "Users can manage own sim positions" 
ON public.sim_positions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own sim transactions" 
ON public.sim_transactions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER OTOMATIS: AUTO-CREATE PROFILE SAAT USER REGISTER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
