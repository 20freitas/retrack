-- Tabela para guardar subscrições dos utilizadores
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Stripe IDs
    customer_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL UNIQUE,
    
    -- Plano
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'pro')),
    price_id TEXT NOT NULL,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
    
    -- Datas
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    
    -- Valores
    amount INTEGER NOT NULL, -- em centavos
    currency TEXT NOT NULL DEFAULT 'eur',
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_customer_id ON user_subscriptions(customer_id);
CREATE INDEX idx_user_subscriptions_subscription_id ON user_subscriptions(subscription_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Utilizadores só podem ver as suas próprias subscrições
CREATE POLICY "Users can view own subscriptions"
    ON user_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Service role pode fazer tudo (para webhooks)
CREATE POLICY "Service role can do everything"
    ON user_subscriptions
    FOR ALL
    USING (auth.role() = 'service_role');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subscriptions_updated_at();

-- Comentários
COMMENT ON TABLE user_subscriptions IS 'Tabela para guardar subscrições Stripe dos utilizadores';
COMMENT ON COLUMN user_subscriptions.plan_type IS 'Tipo de plano: basic ou pro';
COMMENT ON COLUMN user_subscriptions.status IS 'Status da subscrição no Stripe';
COMMENT ON COLUMN user_subscriptions.cancel_at_period_end IS 'Se TRUE, subscrição cancela no fim do período atual';
