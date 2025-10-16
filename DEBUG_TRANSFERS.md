# 🔍 GUIA DE DEBUG - Transferências não funcionando

## ❌ Problema Identificado

As transferências não estão sendo criadas no Stripe, mesmo com pagamentos bem-sucedidos.

---

## 📋 CHECKLIST DE VERIFICAÇÃO

Execute estes passos **na ordem** para identificar o problema:

### ✅ PASSO 1: Verificar Configuração do Webhook

1. Acesse: https://retrack-delta.vercel.app/api/debug/webhook-test

Você deve ver:
```json
{
  "environment": {
    "STRIPE_SECRET_KEY": true,
    "STRIPE_WEBHOOK_SECRET": true,
    ...
  }
}
```

**Se algum estiver `false`:**
- Vá em Vercel → Settings → Environment Variables
- Adicione as chaves que faltam
- Faça redeploy

---

### ✅ PASSO 2: Verificar Eventos do Webhook no Stripe

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique no webhook: `https://retrack-delta.vercel.app/api/webhooks/stripe`
3. Vá em **"Events"** ou **"Recent deliveries"**

**O que procurar:**

✅ **Se eventos aparecem com status 200:**
- Webhook está recebendo eventos corretamente
- Problema está no código de processamento

❌ **Se eventos aparecem com status 400/500:**
- Clique no evento
- Veja o erro no **"Response"**
- Pode ser problema de assinatura (STRIPE_WEBHOOK_SECRET errado)

❌ **Se nenhum evento aparece:**
- Webhook não está configurado corretamente
- Verifique se URL está correta

---

### ✅ PASSO 3: Verificar Logs da Vercel

1. Acesse: https://vercel.com/seu-projeto/logs
2. Filtre por `/api/webhooks/stripe`
3. Procure por:

```
🔔 Webhook received: invoice.payment_succeeded
💵 Invoice payment succeeded: in_xxxxx
🔍 Fetching subscription: sub_xxxxx
📦 Subscription metadata: {...}
```

**Análise dos logs:**

✅ **Se aparecer "No affiliate info found":**
- Metadata não está sendo salva na subscrição
- Vá para PASSO 4

❌ **Se aparecer erro de transfer:**
- Problema com conta Stripe Connect
- Vá para PASSO 5

❌ **Se não aparecer nenhum log:**
- Webhook não está sendo disparado
- Volte ao PASSO 2

---

### ✅ PASSO 4: Verificar Metadata da Subscrição

1. **Encontre o ID da subscrição:**
   - Vá em https://dashboard.stripe.com/test/subscriptions
   - Clique na subscrição do teste
   - Copie o ID (começa com `sub_`)

2. **Verifique a metadata:**
   - Acesse: `https://retrack-delta.vercel.app/api/debug/subscription?id=sub_XXXXX`
   - Substitua `sub_XXXXX` pelo ID real

**Deve retornar:**
```json
{
  "subscription_id": "sub_xxxxx",
  "metadata": {
    "affiliate_ref_code": "testediogo",
    "affiliate_account_id": "acct_1SItVvIn0PeWUbAZ",
    "affiliate_commission_rate": "70"
  }
}
```

**Se metadata estiver vazia `{}`:**

❌ **PROBLEMA: Metadata não está sendo salva no checkout!**

**Solução:**
```typescript
// Verificar em: app/api/checkout/create/route.ts

// Deve ter isto:
sessionParams.subscription_data = {
  metadata: {
    affiliate_ref_code: ref_code,
    affiliate_account_id: affiliateInfo.stripe_account_id,
    affiliate_commission_rate: affiliateInfo.commission_rate.toString(),
  },
};
```

---

### ✅ PASSO 5: Verificar Conta Stripe Connect do Afiliado

1. Acesse: https://dashboard.stripe.com/test/connect/accounts/overview
2. Procure pela conta: `acct_1SItVvIn0PeWUbAZ`

**Verifique:**

- ✅ Conta existe?
- ✅ Status está "Active" (ativo)?
- ✅ "Charges enabled" está ✅?
- ✅ "Transfers enabled" está ✅?

**Se conta não estiver ativa:**
- Conta precisa ser ativada primeiro
- Em teste: ative manualmente no dashboard
- Em produção: complete onboarding da conta Express

---

### ✅ PASSO 6: Testar Transfer Manualmente

Vamos criar um endpoint para testar transfer manual:

```typescript
// Crie: app/api/debug/test-transfer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const transfer = await stripe.transfers.create({
      amount: 100, // $1.00 teste
      currency: 'usd',
      destination: 'acct_1SItVvIn0PeWUbAZ',
      description: 'Test transfer',
    });

    return NextResponse.json({ success: true, transfer });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

**Testar:**
```bash
curl -X POST https://retrack-delta.vercel.app/api/debug/test-transfer
```

**Se der erro:**
- Veja a mensagem de erro
- Pode ser problema de saldo, conta inativa, etc.

---

## 🎯 CAUSAS MAIS COMUNS

### 1. **Metadata Não Está Sendo Salva**

**Sintoma:** Logs mostram "No affiliate info found"

**Causa:** `subscription_data.metadata` não está sendo passado corretamente no checkout

**Solução:** Verificar código em `app/api/checkout/create/route.ts`

---

### 2. **Webhook Secret Errado**

**Sintoma:** Eventos aparecem com erro 400 no Stripe Dashboard

**Causa:** `STRIPE_WEBHOOK_SECRET` não corresponde ao webhook configurado

**Solução:**
1. Vá em https://dashboard.stripe.com/test/webhooks
2. Clique no webhook
3. Vá em "Signing secret"
4. Copie o secret (começa com `whsec_`)
5. Atualize no Vercel (Environment Variables)
6. Redeploy

---

### 3. **Conta Connect Inativa**

**Sintoma:** Erro "No such destination"

**Causa:** Conta Stripe Connect não existe ou não está ativa

**Solução:**
1. Verificar se conta existe no dashboard
2. Ativar conta manualmente em modo teste
3. Em produção: completar onboarding

---

### 4. **Evento Errado Sendo Escutado**

**Sintoma:** Nenhum log aparece

**Causa:** Webhook não está configurado para escutar `invoice.payment_succeeded`

**Solução:**
1. Vá em https://dashboard.stripe.com/test/webhooks
2. Edite o webhook
3. Adicione evento: `invoice.payment_succeeded`
4. Salve

---

## 🔧 COMANDOS ÚTEIS

### Ver logs em tempo real (Vercel CLI):
```bash
vercel logs --follow
```

### Disparar evento de teste do Stripe CLI:
```bash
stripe trigger invoice.payment_succeeded
```

### Ver eventos recentes do webhook:
```bash
stripe webhooks logs
```

---

## 📞 PRÓXIMOS PASSOS

1. **Execute PASSO 1** - Verificar configuração
2. **Execute PASSO 2** - Ver eventos do webhook
3. **Execute PASSO 3** - Ver logs da Vercel
4. **Execute PASSO 4** - Verificar metadata

**Me envie:**
- Screenshot dos eventos do webhook (Stripe Dashboard)
- Logs da Vercel quando fizer um pagamento
- Resultado do endpoint `/api/debug/subscription?id=sub_xxxxx`

Com essas informações vou identificar exatamente onde está o problema! 🔍
