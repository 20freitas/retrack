# Sistema de Afiliados com Stripe Connect

Este documento explica como configurar e usar o sistema de afiliados implementado no Retrack.

## 📋 Visão Geral

O sistema permite que influencers promovam o Retrack através de links com códigos de referência e recebam comissões automáticas via Stripe Connect. As comissões são transferidas diretamente para as contas Stripe Express dos afiliados.

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (já existentes)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2. Configurar Banco de Dados

Execute a migration SQL para criar a tabela de afiliados:

```bash
# Conecte-se ao Supabase e execute:
supabase/migrations/create_affiliates_table.sql
```

Ou use o painel do Supabase para executar o SQL diretamente.

### 3. Configurar Stripe Connect

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com)
2. Ative o **Stripe Connect**
3. Configure as opções de Express Dashboard
4. Crie contas Express para seus afiliados manualmente

### 4. Configurar Webhook do Stripe

1. Acesse **Developers > Webhooks** no Stripe Dashboard
2. Adicione um novo endpoint: `https://seusite.com/api/webhooks/stripe`
3. Selecione os eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
4. Copie o **Signing Secret** para `STRIPE_WEBHOOK_SECRET`

## 👥 Como Criar um Afiliado

### Método 1: Via API (Recomendado)

Use uma ferramenta como Postman ou cURL:

```bash
curl -X POST https://seusite.com/api/affiliates/create \
  -H "Content-Type: application/json" \
  -d '{
    "ref_code": "joao123",
    "stripe_account_id": "acct_xxxxxxxxxxxxx",
    "commission_rate": 15.00,
    "name": "João Silva",
    "email": "joao@example.com"
  }'
```

**Campos:**
- `ref_code` (obrigatório): Código único alfanumérico (ex: joao123)
- `stripe_account_id` (obrigatório): ID da conta Stripe Connect do afiliado
- `commission_rate` (opcional): Percentagem de comissão (padrão: 10%)
- `name` (opcional): Nome do afiliado
- `email` (opcional): Email do afiliado

### Método 2: Diretamente no Banco de Dados

Insira manualmente via Supabase:

```sql
INSERT INTO affiliates (ref_code, stripe_account_id, commission_rate, name, email)
VALUES ('testediogo', 'acct_1SItVvIn0PeWUbAZ', 70.00, 'Diogo Freitas', 'joao@example.com');
```

## 🔗 Como Funciona o Fluxo

### 1. Influencer Compartilha Link

O influencer recebe e compartilha um link como:
```
https://seusite.com?ref=joao123
```

### 2. Cliente Acessa e Compra

- Cliente acessa o site com o parâmetro `?ref=joao123`
- Um badge verde aparece no topo indicando o código de referência
- Todos os botões "Get Started" preservam o parâmetro na URL
- Cliente clica em "Get Started" e é redirecionado para `/checkout?ref=joao123`

### 3. Processamento do Pagamento

- A página de checkout captura o código de referência
- API `/api/checkout/create` valida o código e busca info do afiliado
- Cria uma sessão Stripe com `transfer_data` configurado
- Cliente é redirecionado para o Stripe Checkout
- Após pagamento bem-sucedido, a comissão é **automaticamente transferida** para a conta do afiliado

### 4. Afiliado Recebe Comissão

- A transferência acontece automaticamente via Stripe
- O afiliado vê o pagamento no **Stripe Express Dashboard**
- Não precisa de intervenção manual

## 💰 Exemplo de Cálculo de Comissão

**Cenário:**
- Produto: €29.99
- Taxa de comissão: 15%

**Cálculo:**
- Comissão = €29.99 × 15% = €4.50
- Você recebe: €25.49
- Afiliado recebe: €4.50

## 🧪 Testar o Sistema

### Teste Local

1. **Criar afiliado de teste:**
```bash
curl -X POST http://localhost:3000/api/affiliates/create \
  -H "Content-Type: application/json" \
  -d '{
    "ref_code": "teste123",
    "stripe_account_id": "acct_test_xxxxx",
    "commission_rate": 10.00
  }'
```

2. **Acessar página com referência:**
```
http://localhost:3000?ref=teste123
```

3. **Testar checkout:**
- Clique em "Get Started"
- Verifique se aparece o código de referência
- Use cartão de teste do Stripe: `4242 4242 4242 4242`

### Teste de Webhook (Stripe CLI)

```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Em outro terminal, disparar evento de teste
stripe trigger checkout.session.completed
```

## 📊 Verificar Afiliado

Para verificar se um afiliado existe:

```bash
curl "https://seusite.com/api/affiliates/create?ref_code=joao123"
```

## 🔒 Segurança

- ✅ Validação de códigos de referência
- ✅ Verificação de assinatura de webhooks
- ✅ RLS (Row Level Security) habilitado no Supabase
- ✅ Transferências automáticas via Stripe (sem acesso manual)
- ✅ Logs de todas as transações

## 🐛 Troubleshooting

### "Invalid referral code"
- Verifique se o afiliado está ativo no banco de dados
- Confirme que o `ref_code` está correto

### "Webhook signature verification failed"
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se que o endpoint está acessível publicamente

### Comissão não foi transferida
- Verifique se o `stripe_account_id` está correto
- Confirme que a conta Stripe Connect está ativa
- Verifique os logs do webhook

## 📝 Notas Importantes

1. **Contas Stripe Express**: Você precisa criar manualmente as contas Express dos afiliados no Stripe Dashboard ou via API.

2. **Taxas do Stripe**: Além das comissões, o Stripe cobra suas taxas padrão (2.9% + €0.25 na Europa).

3. **Transferências**: As transferências são instantâneas, mas o afiliado só recebe o dinheiro na sua conta bancária de acordo com o calendário do Stripe (geralmente 2-7 dias).

4. **Modo Teste**: Use chaves de teste do Stripe durante o desenvolvimento.

## 📧 Suporte

Para questões sobre:
- **Stripe**: [Documentação Stripe Connect](https://stripe.com/docs/connect)
- **Sistema**: Verifique os logs em `/api/webhooks/stripe`
