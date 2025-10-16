# 🐛 DEBUG: Subscrições Não Estão a Guardar

## 🔍 Problemas Identificados

1. ❌ Subscrições não aparecem na tabela `user_subscriptions`
2. ❌ Sistema permite duplicar subscrições

---

## 🛠️ Fixes Implementados

### **1. Webhook Melhorado** (`app/api/webhooks/stripe/route.ts`)

Adicionei mais logging e melhor handling:

```typescript
// Agora tenta múltiplas formas de encontrar user:
1. session.metadata.user_id
2. subscription.metadata.user_id  
3. Busca por email usando supabase.auth.admin.listUsers()

// Se não encontrar user_id, apenas loga e continua
// (subscrição fica no Stripe mas não na DB)
```

### **2. Endpoint de Teste** (`/api/subscription/test-insert`)

Criei endpoint para testar insert direto na DB:

```bash
GET /api/subscription/test-insert?user_id=SEU_USER_ID
```

---

## 🧪 Passos de Debug

### **Passo 1: Descobrir Teu User ID**

```bash
# No browser console (depois de fazer login):
# 1. Ir para Application → Storage → Local Storage
# 2. Procurar por supabase.auth.token
# OU fazer query SQL no Supabase:

SELECT id, email FROM auth.users WHERE email = 'teu@email.com';
```

### **Passo 2: Testar Insert Manual**

```bash
# Testa se consegues inserir na tabela
GET https://retrack-delta.vercel.app/api/subscription/test-insert?user_id=TEU_USER_ID
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Test subscription created successfully!",
  "data": [...]
}
```

**Se der erro:**
- Verificar RLS policies na tabela
- Verificar se user_id existe na tabela auth.users
- Ver detalhes do erro

### **Passo 3: Verificar RLS Policies**

A tabela `user_subscriptions` tem RLS ativado. Precisa de policies corretas!

**No Supabase Dashboard:**
```sql
-- Ver policies existentes
SELECT * FROM pg_policies WHERE tablename = 'user_subscriptions';

-- Se necessário, criar policy para service_role (webhooks)
CREATE POLICY "service_role_all_access"
ON user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy para users verem as suas
CREATE POLICY "users_view_own"
ON user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### **Passo 4: Fazer Novo Checkout e Ver Logs**

```bash
# 1. Fazer novo checkout com ref code
https://retrack-delta.vercel.app?ref=testediogo

# 2. Ver logs da Vercel em tempo real
https://vercel.com/20freitas/retrack/logs

# 3. Procurar por:
✅ Checkout completed
💾 Saving subscription to database
🔍 Attempting to save with: { user_id: ..., subscription_id: ... }
✅ Subscription saved to database successfully!

# OU

❌ No user_id in metadata
⚠️ Skipping DB save - no user_id available
```

---

## 🔧 Possíveis Causas do Problema

### **Causa 1: user_id não está a ser enviado**

**Verificar:**
- CheckoutButton está a buscar user_id? (useEffect)
- user_id está no body do request?
- Session metadata tem user_id?

**Como ver:**
```javascript
// No CheckoutButton, adiciona console.log:
console.log('User ID being sent:', userId);
```

### **Causa 2: RLS está a bloquear inserts**

**Sintoma:**
```json
{
  "error": "new row violates row-level security policy"
}
```

**Fix:**
```sql
-- Garantir que service_role tem acesso total
CREATE POLICY "service_role_full_access"
ON user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

### **Causa 3: supabase client não tem permissões**

**Verificar:**
O webhook usa `supabase` client de `@/lib/supabaseClient`.

**Garantir que usa service_role key:**

```typescript
// lib/supabaseClient.ts
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← IMPORTANTE!
);
```

**Se está a usar anon key:**
- Webhook NÃO VAI CONSEGUIR inserir
- Precisa de service_role key

### **Causa 4: user_id inválido ou não existe**

**Verificar:**
```sql
-- No Supabase SQL Editor
SELECT id, email FROM auth.users WHERE id = 'SEU_USER_ID';
```

Se não retornar nada → user_id está errado!

---

## ✅ Checklist de Diagnóstico

Execute por ordem:

- [ ] **Verificar supabase client usa service_role key**
  - Ver `lib/supabaseClient.ts`
  - Tem `SUPABASE_SERVICE_ROLE_KEY` nas env vars?

- [ ] **Verificar RLS policies**
  - service_role tem acesso total?
  - Execute SQL acima

- [ ] **Testar insert manual**
  - Chamar `/api/subscription/test-insert?user_id=...`
  - Funcionou? → Problema está no webhook
  - Falhou? → Problema está na DB/RLS

- [ ] **Verificar logs do webhook**
  - Ver Vercel logs
  - Procurar por "💾 Saving subscription"
  - Ver se tem user_id

- [ ] **Verificar CheckoutButton envia user_id**
  - Console.log no frontend
  - Ver network tab do browser

---

## 🚀 Quick Fix

Se tudo falhar, adiciona isto temporariamente para debug:

```typescript
// No webhook, na função saveSubscriptionToDatabase, logo no início:
console.log('🔍 FULL DEBUG:');
console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));
console.log('Subscription metadata:', JSON.stringify(subscription.metadata, null, 2));
console.log('Customer email:', session.customer_details?.email);
console.log('Subscription ID:', subscription.id);
```

Deploy, faz novo checkout, e manda-me os logs! 🎯

---

## 📞 Próximos Passos

1. **Testa o endpoint de debug:**
   ```
   /api/subscription/test-insert?user_id=TEU_USER_ID
   ```

2. **Se funcionar:** Problema está no webhook não receber user_id

3. **Se não funcionar:** Problema está nas permissions/RLS

**Qual é o resultado do teste? Manda print do erro! 📸**
