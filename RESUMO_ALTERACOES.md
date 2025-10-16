# ✅ RESUMO DAS ALTERAÇÕES - Sistema de Afiliados

## 🎯 O que foi alterado:

### 1. ❌ Removido
- Badge verde "🎉 Você está usando o código de referência: xxx"
- Página intermediária `/checkout`

### 2. ✅ Adicionado
- **Checkout direto** ao clicar em "Get Started"
- Suporte para **2 planos de subscrição**:
  - Basic: $9.99/mês
  - Pro: $19.99/mês
- Sistema de **comissões recorrentes** (afiliado recebe a cada renovação)

---

## 📋 PASSOS PARA CONFIGURAR

### PASSO 1: Criar Produtos no Stripe

Siga o guia completo: **`STRIPE_PRODUCTS_SETUP.md`**

**Resumo rápido:**
1. Acesse https://dashboard.stripe.com/test/products
2. Clique em "+ Add product"
3. Crie produto "Retrack Basic" com preço $9.99/mês
4. **Copie o Price ID** (ex: `price_1ABC123...`)
5. Repita para "Retrack Pro" com $19.99/mês
6. **Copie o Price ID** também

---

### PASSO 2: Configurar Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```env
# Price IDs dos produtos Stripe
NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID=price_1ABC123...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1DEF456...

# Chaves Stripe (já devem estar configuradas)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (já devem estar configuradas)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**⚠️ IMPORTANTE:** Reinicie o servidor após adicionar as variáveis!

---

### PASSO 3: Atualizar Webhooks do Stripe

O webhook agora precisa escutar eventos de subscrição:

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique no seu webhook (ou crie um novo)
3. Adicione estes eventos:
   - `checkout.session.completed`
   - `invoice.payment_succeeded` ⭐ NOVO
   - `customer.subscription.created` ⭐ NOVO
   - `customer.subscription.deleted` ⭐ NOVO
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`

---

## 🔄 Como Funciona Agora

### Fluxo SEM Afiliado:
```
Cliente acessa site
  ↓
Clica "Get Started" no plano
  ↓
Vai direto para Stripe Checkout
  ↓
Paga
  ↓
Acessa dashboard
```

### Fluxo COM Afiliado:
```
Cliente acessa: seusite.com?ref=joao123
  ↓
Clica "Get Started" no plano
  ↓
Vai direto para Stripe Checkout (ref preservado internamente)
  ↓
Paga $19.99 (Pro)
  ↓
Afiliado recebe comissão (ex: 70% = $13.99)
  ↓
MENSALMENTE: Cliente renova automaticamente
  ↓
Afiliado recebe comissão novamente!
```

---

## 💰 Comissões Recorrentes

**Importante:** Com subscrições, o afiliado recebe comissão **a cada renovação**!

**Exemplo (70% de comissão no Pro):**
- **Mês 1:** Cliente paga $19.99 → Afiliado recebe $13.99
- **Mês 2:** Cliente paga $19.99 → Afiliado recebe $13.99
- **Mês 3:** Cliente paga $19.99 → Afiliado recebe $13.99
- ... e assim por diante!

Isso é processado automaticamente pelo webhook `invoice.payment_succeeded`.

---

## 🧪 Como Testar

### 1. Verificar se Price IDs estão corretos:

```powershell
# Ver variáveis de ambiente
cat .env.local | Select-String "PRICE_ID"
```

### 2. Testar sem referência:

```
http://localhost:3000
```
- Clique em "Get Started" no plano Basic ou Pro
- Deve ir direto para Stripe Checkout
- Preço deve estar correto ($9.99 ou $19.99)

### 3. Testar COM referência:

```
http://localhost:3000?ref=testediogo
```
- Clique em "Get Started" 
- Complete o checkout
- No webhook, deve aparecer log de transferência

### 4. Verificar webhook (Stripe CLI):

```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Você deve ver:
```
✅ checkout.session.completed
✅ invoice.payment_succeeded
✅ transfer.created
```

---

## 📂 Arquivos Modificados

```
✏️ Modificados:
- app/page.tsx (removido badge, botões diretos)
- app/api/checkout/create/route.ts (usa price_id, mode: subscription)
- app/api/webhooks/stripe/route.ts (comissões recorrentes)
- .env.local (adicionar PRICE_IDs)

➕ Criados:
- components/CheckoutButton.tsx (botão de checkout direto)
- STRIPE_PRODUCTS_SETUP.md (guia de setup)
- RESUMO_ALTERACOES.md (este arquivo)

❌ Não usado mais:
- app/checkout/page.tsx (ainda existe mas não é necessária)
```

---

## 🔍 Diferenças: Pagamento Único vs Subscrição

### Antes (Pagamento Único):
- Cliente paga 1x €29.99
- Afiliado recebe comissão 1x
- Transfer automático via `transfer_data`

### Agora (Subscrição):
- Cliente paga $9.99 ou $19.99/mês
- Afiliado recebe comissão **todo mês**
- Transfer criado via webhook `invoice.payment_succeeded`

---

## ⚠️ Pontos Importantes

### 1. Período de Teste (Trial)
Se adicionar trial de 7 dias no Stripe:
- Cliente não paga nos primeiros 7 dias
- Afiliado **NÃO** recebe comissão no trial
- Após 7 dias, primeira cobrança → primeira comissão

### 2. Cancelamentos
Se cliente cancelar:
- Subscrição termina no fim do período pago
- Afiliado **NÃO** recebe mais comissões
- Webhook `customer.subscription.deleted` é disparado

### 3. Falhas de Pagamento
Se cartão for recusado na renovação:
- Stripe tenta novamente automaticamente
- Webhook `invoice.payment_failed` é disparado
- Afiliado não recebe comissão até pagamento suceder

### 4. Mudança de Plano
Se cliente mudar de Basic para Pro:
- Nova comissão calculada baseada no novo valor
- Afiliado recebe mais (se Pro for mais caro)

---

## 🚀 Checklist de Deploy

Antes de ir para produção:

- [ ] Criar produtos em modo **Live** no Stripe
- [ ] Atualizar Price IDs no .env.production
- [ ] Usar chaves Live do Stripe (`sk_live_`, `pk_live_`)
- [ ] Configurar webhook em produção
- [ ] Testar checkout em produção com cartão real
- [ ] Verificar se comissões estão sendo transferidas
- [ ] Configurar Customer Portal do Stripe
- [ ] Adicionar política de cancelamento/reembolso

---

## 📞 Suporte

**Documentação criada:**
- `AFFILIATE_SYSTEM.md` - Sistema de afiliados completo
- `STRIPE_PRODUCTS_SETUP.md` - Como criar produtos
- `TESTE_LOCAL.md` - Como testar localmente
- `RESUMO_ALTERACOES.md` - Este arquivo

**Links úteis:**
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions)
- [Stripe Connect Transfers](https://stripe.com/docs/connect/charges-transfers)
- [Testing Stripe](https://stripe.com/docs/testing)

---

## ✅ Está Tudo Pronto!

Agora você só precisa:
1. Criar os 2 produtos no Stripe
2. Copiar os Price IDs para .env.local
3. Reiniciar o servidor
4. Testar!

**Código de referência funciona assim:**
```
https://seusite.com?ref=joao123
```

O código é capturado automaticamente e enviado ao Stripe. Comissões são pagas todo mês automaticamente! 🎉
