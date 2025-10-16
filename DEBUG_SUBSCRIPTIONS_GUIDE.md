# 🔍 DEBUG: Por Que Não Está a Guardar na DB?

## 🎯 Vamos Testar Passo a Passo

### **Teste 1: Verificar se supabaseAdmin funciona**

```bash
# Chamar endpoint de teste:
http://localhost:3000/api/debug/test-db

# OU em produção:
https://retrack-delta.vercel.app/api/debug/test-db
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "All tests passed!",
  "tests": {
    "select": { "passed": true, "rowsFound": 0 },
    "insert": { "passed": true, "data": [...] }
  }
}
```

**Se falhar:** Problema está nas permissions/RLS da tabela.

---

### **Teste 2: Fazer Checkout e Ver Logs**

#### **Passos:**

1. **Iniciar dev server:**
```powershell
npm run dev
```

2. **Abrir nova janela e iniciar Stripe CLI:**
```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. **Fazer checkout:**
- Ir para: http://localhost:3000
- Clicar "Get Started"
- Preencher com cartão teste: 4242 4242 4242 4242
- Completar pagamento

4. **Ver logs no terminal onde está o Stripe CLI**

#### **Logs que DEVEM aparecer:**

```
✅ Checkout completed: cs_test_...
📋 Session details: { mode: 'subscription', ... }
🔔 This is a subscription checkout!
🔍 Subscription ID: sub_...
📡 Fetching subscription from Stripe...
✅ Subscription retrieved: sub_...
📦 Subscription metadata: { affiliate_ref_code: 'testediogo', ... }
💾 Calling saveSubscriptionToDatabase...
💾 Saving subscription to database: sub_...
🔍 Trying to find user by email: ...
📝 Attempting to save with: { user_id: '...', subscription_id: '...' }
✅ Subscription saved to database successfully!
💾 Saved data: [...]
✅ saveSubscriptionToDatabase completed!
```

#### **Se NÃO vires estes logs:**

**Problema possível:**
- Webhook não está a receber eventos
- Stripe CLI não está conectado
- URL do webhook está errada

---

### **Teste 3: Verificar Webhook no Stripe Dashboard**

Se estiveres a testar em **produção** (não local):

1. **Ir para:** https://dashboard.stripe.com/test/webhooks
2. **Verificar:** Webhook está ativo?
3. **URL deve ser:** `https://retrack-delta.vercel.app/api/webhooks/stripe`
4. **Ver eventos recentes:** Click no webhook → Events
5. **Ver detalhes:** Click num evento para ver response

---

## 🐛 Diagnóstico por Sintomas

### **Sintoma 1: Nenhum log aparece**

**Causa:** Webhook não está a receber eventos.

**Fix:**
```powershell
# Local: Reiniciar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Produção: Verificar webhook no Stripe Dashboard
# URL: https://retrack-delta.vercel.app/api/webhooks/stripe
# Eventos: checkout.session.completed
```

---

### **Sintoma 2: Logs aparecem mas param em "Calling saveSubscriptionToDatabase"**

**Causa:** Erro dentro da função save.

**Ver logs específicos:**
```
❌ Error in subscription save process: ...
Error message: ...
```

**Possíveis causas:**
- supabaseAdmin não tem permissions
- Tabela não existe
- User_id inválido

---

### **Sintoma 3: "No user_id in metadata" ou "Skipping DB save"**

**Causa:** user_id não está a ser passado.

**Fix:** Verificar se CheckoutButton está a enviar user_id:

```typescript
// components/CheckoutButton.tsx
useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      console.log('✅ User ID found:', user.id); // ← Adicionar este log
      setUserId(user.id);
    } else {
      console.log('⚠️ No user found'); // ← E este
    }
  });
}, []);
```

---

### **Sintoma 4: "Error saving subscription to database" com RLS error**

**Causa:** RLS está a bloquear insert.

**Fix:** Garantir policy para service_role:

```sql
-- No Supabase SQL Editor:
CREATE POLICY "service_role_bypass_rls"
ON user_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ou desativar RLS temporariamente para debug:
ALTER TABLE user_subscriptions DISABLE ROW LEVEL SECURITY;
```

---

## 🔧 Quick Debug Commands

### **Ver tabela no Supabase:**
```sql
SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 10;
```

### **Ver policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_subscriptions';
```

### **Ver se service_role tem acesso:**
```sql
-- Deve retornar policies que permitem TO service_role
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_subscriptions';
```

---

## 🚀 Próximos Passos

**Execute por ordem:**

1. ✅ **Testar supabaseAdmin:**
   ```
   GET /api/debug/test-db
   ```
   - Funcionou? → Avançar
   - Falhou? → Ver erro e corrigir RLS/permissions

2. ✅ **Fazer checkout local com logs:**
   ```
   npm run dev
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   - Ver logs no terminal
   - Identificar onde para

3. ✅ **Verificar user_id está a ser enviado:**
   - Console.log no CheckoutButton
   - Ver network tab: body tem user_id?

4. ✅ **Ver logs detalhados do webhook:**
   - Procurar por emojis: 🔔 💾 ✅ ❌
   - Identificar mensagem de erro exata

---

## 📞 Reportar Problema

Depois de executar os testes, envia-me:

1. **Resultado do teste /api/debug/test-db:**
   ```json
   { success: true/false, ... }
   ```

2. **Logs do webhook (copiar do terminal):**
   ```
   ✅ Checkout completed: ...
   💾 Calling saveSubscriptionToDatabase...
   ...
   ```

3. **Screenshot do erro (se houver)**

4. **Resposta destas queries:**
   ```sql
   SELECT COUNT(*) FROM user_subscriptions;
   SELECT * FROM pg_policies WHERE tablename = 'user_subscriptions';
   ```

Com estas informações consigo identificar o problema exato! 🎯
