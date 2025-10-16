-- Create affiliates table
CREATE TABLE IF NOT EXISTS public.affiliates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ref_code VARCHAR(50) UNIQUE NOT NULL,
    stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 70.00,
    name VARCHAR(255),
    email VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ref_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code ON public.affiliates(ref_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_stripe_account_id ON public.affiliates(stripe_account_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read affiliates
CREATE POLICY "Allow public read access to affiliates" ON public.affiliates
    FOR SELECT USING (active = true);

-- Create policy to allow service role to manage affiliates
CREATE POLICY "Allow service role to manage affiliates" ON public.affiliates
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE public.affiliates IS 'Stores affiliate information for commission tracking';
COMMENT ON COLUMN public.affiliates.ref_code IS 'Unique referral code used in URLs (e.g., joao123)';
COMMENT ON COLUMN public.affiliates.stripe_account_id IS 'Stripe Connect account ID for receiving commissions';
COMMENT ON COLUMN public.affiliates.commission_rate IS 'Commission percentage (e.g., 10.00 for 10%)';
