# 💰 Como Funcionam as Comissões de 70%

## 📋 Visão Geral

O sistema está configurado para transferir **70% do valor da subscrição** automaticamente para a conta Stripe do afiliado a cada pagamento mensal.

---

## 🔄 Fluxo Completo

### 1️⃣ Cliente Faz Checkout

```
Cliente acessa: seusite.com?ref=testediogo
         ↓
Clica em "Get Started" ($19.99 Pro)
         ↓
Sistema busca info do afiliado no banco de dados
         ↓
Cria Checkout Session com metadata do afiliado
         ↓
Cliente paga $19.99 no Stripe
```

### 2️⃣ Stripe Processa Pagamento

```
Stripe cobra $19.99 do cliente
         ↓
Envia webhook: invoice.payment_succeeded
         ↓
Seu servidor recebe o webhook
```

### 3️⃣ Sistema Transfere Comissão

```
Webhook lê metadata da subscrição
         ↓
Encontra: commission_rate = 70%
         ↓
Calcula: $19.99 × 70% = $13.99
         ↓
Cria transfer de $13.99 para conta do afiliado
         ↓
Você fica com: $19.99 - $13.99 = $6.00
```

---

## 💻 Como Está Implementado

### No Checkout (`/api/checkout/create`):

```typescript
// 1. Busca info do afiliado
const affiliate = await supabase
  .from('affiliates')
  .select('*')
  .eq('ref_code', 'testediogo')
  .single();

// 2. Calcula comissão antecipadamente
const amount = 1999; // $19.99 em centavos
const commissionRate = 70; // 70% do affiliate
const affiliateAmount = Math.floor(1999 * 0.70); // = 1399 ($13.99)

// 3. Salva na metadata da subscrição
sessionParams.subscription_data = {
  metadata: {
    affiliate_ref_code: 'testediogo',
    affiliate_account_id: 'acct_1SItVvIn0PeWUbAZ',
    affiliate_commission_rate: '70',
  },
};
```

### No Webhook (`/api/webhooks/stripe`):

```typescript
// 1. Recebe evento invoice.payment_succeeded
const invoice = event.data.object;

// 2. Busca metadata da subscrição
const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
const commissionRate = subscription.metadata.affiliate_commission_rate; // "70"

// 3. Calcula comissão do valor real pago
const amountPaid = invoice.amount_paid; // 1999 centavos
const commissionAmount = Math.floor(amountPaid * 0.70); // 1399 centavos

// 4. Cria transferência
const transfer = await stripe.transfers.create({
  amount: 1399, // $13.99
  currency: 'usd',
  destination: 'acct_1SItVvIn0PeWUbAZ',
  description: 'Commission 70% for testediogo',
});
```

---

## 🧮 Cálculo da Comissão

### Exemplo Real (Plano Pro - $19.99):

| Item | Valor |
|------|-------|
| **Preço do plano** | $19.99 |
| **Taxa do afiliado** | 70% |
| **Vai para afiliado** | $19.99 × 70% = **$13.99** |
| **Você fica com** | $19.99 - $13.99 = **$6.00** |
| **Taxas Stripe** | ~$0.88 (2.9% + $0.30) |
| **Seu lucro líquido** | $6.00 - $0.88 = **$5.12** |

### Exemplo Real (Plano Basic - $9.99):

| Item | Valor |
|------|-------|
| **Preço do plano** | $9.99 |
| **Taxa do afiliado** | 70% |
| **Vai para afiliado** | $9.99 × 70% = **$6.99** |
| **Você fica com** | $9.99 - $6.99 = **$3.00** |
| **Taxas Stripe** | ~$0.59 (2.9% + $0.30) |
| **Seu lucro líquido** | $3.00 - $0.59 = **$2.41** |

---

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Logs do Webhook

Quando um pagamento é processado, você deve ver nos logs:

```bash
💰 Subscription payment with affiliate testediogo, commission rate: 70%
📊 Invoice amount: $19.99, Commission: $13.99 (70%)
✅ Transfer created: tr_xxxxx - $13.99 sent to acct_1SItVvIn0PeWUbAZ
```

### 2. Verificar no Stripe Dashboard

**Seu Dashboard (Platform):**
1. **Payments**: Ver pagamento de $19.99
2. **Transfers**: Ver transferência de $13.99 saindo
3. **Balance**: Ver $6.00 restante (menos taxas)

**Dashboard do Afiliado (Express):**
1. Ver transferência recebida de $13.99
2. Ver no "Available balance"
3. Será pago para conta bancária dele em 2-7 dias

### 3. Testar com Stripe CLI

```bash
# Terminal 1: Escutar webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Fazer um pagamento de teste
# (Acesse o site e faça checkout)

# Você verá no Terminal 1:
✅ invoice.payment_succeeded
✅ transfer.created
```

---

## ⚙️ Configuração da Taxa de Comissão

A taxa está definida no **banco de dados** (tabela `affiliates`):

```sql
-- Ver taxa atual
SELECT ref_code, commission_rate FROM affiliates WHERE ref_code = 'testediogo';

-- Resultado:
-- ref_code      | commission_rate
-- testediogo    | 70.00

-- Alterar taxa (exemplo: mudar para 80%)
UPDATE affiliates 
SET commission_rate = 80.00 
WHERE ref_code = 'testediogo';
```

### Criar Afiliado com Taxa Personalizada:

```bash
curl -X POST http://localhost:3000/api/affiliates/create \
  -H "Content-Type: application/json" \
  -d '{
    "ref_code": "influencer123",
    "stripe_account_id": "acct_xxxxx",
    "commission_rate": 70.00,
    "name": "Influencer Name"
  }'
```

---

## 🔄 Comissões Recorrentes

**IMPORTANTE:** Com subscrições, o afiliado recebe **todo mês**!

### Timeline:

```
Mês 1: Cliente paga $19.99 → Afiliado recebe $13.99
Mês 2: Cliente paga $19.99 → Afiliado recebe $13.99
Mês 3: Cliente paga $19.99 → Afiliado recebe $13.99
... continua até cliente cancelar
```

### Se Cliente Cancelar:

```
Cliente cancela no dia 15
         ↓
Subscrição termina no fim do mês (dia 30)
         ↓
Último pagamento já processado
         ↓
Afiliado recebeu última comissão
         ↓
Nenhum pagamento futuro
```

---

## ⚠️ Problemas Comuns

### ❌ "Afiliado recebe 100% do valor"

**Causa:** Metadata não está sendo salva corretamente na subscrição.

**Solução:**
1. Verifique se o código usa `subscription_data.metadata` e não `metadata`
2. Verifique se `commission_rate` está sendo lido como `affiliate_commission_rate`

### ❌ "Transfer failed: Insufficient funds"

**Causa:** Sua conta Stripe não tem saldo suficiente.

**Solução:**
- Em modo teste: Não há problema real
- Em produção: Aguarde pagamentos serem processados antes de transferir

### ❌ "Transfer failed: Invalid destination"

**Causa:** `stripe_account_id` do afiliado está errado.

**Solução:**
- Verifique se a conta Stripe Connect do afiliado existe
- Confirme que a conta está ativa e verificada

### ❌ "Webhook não dispara"

**Causa:** Webhook não está configurado ou URL está errada.

**Solução:**
```bash
# Localmente
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Produção: Configure em https://dashboard.stripe.com/webhooks
Endpoint: https://seusite.com/api/webhooks/stripe
```

---

## 📊 Monitoramento

### Dashboard para Ver Comissões:

1. **Stripe Dashboard > Transfers**
   - Ver todas as transferências enviadas
   - Filtrar por affiliate_ref_code

2. **Stripe Dashboard > Connected Accounts**
   - Ver contas dos afiliados
   - Ver balanço de cada um

3. **Logs do Servidor**
   ```bash
   # Ver logs em tempo real
   npm run dev
   
   # Procurar por transferências
   grep "Transfer created" logs.txt
   ```

---

## 🎯 Checklist de Verificação

Antes de ir para produção, verifique:

- [ ] Afiliado criado com `commission_rate = 70.00`
- [ ] Webhook configurado no Stripe com `invoice.payment_succeeded`
- [ ] `STRIPE_WEBHOOK_SECRET` correto no `.env`
- [ ] Teste com pagamento real mostrou transferência de 70%
- [ ] Logs mostraram: `Transfer created: ... $13.99 sent to ...`
- [ ] Dashboard do afiliado mostra o valor recebido
- [ ] Seu dashboard mostra o restante (30%)

---

## 💡 Resumo

✅ **Sistema configurado para 70% de comissão automática**

✅ **Funciona assim:**
- Cliente paga → Stripe cobra
- Webhook dispara → Calcula 70%
- Transfer criado → Afiliado recebe
- Todo mês → Processo repete

✅ **Você controla:**
- Taxa por afiliado (banco de dados)
- Quando ativar/desativar afiliado
- Ver todas as transferências no Stripe

✅ **Afiliado vê:**
- Pagamentos no Express Dashboard
- Transferências para conta bancária
- Histórico completo

---

🎉 **Sistema totalmente automático! Nenhuma intervenção manual necessária!**
