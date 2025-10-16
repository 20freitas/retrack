# 🔧 FIX: Checkout Agora Funciona Com ou Sem Login

## 🎯 Problema Resolvido

Antes: Sistema exigia login obrigatório para fazer checkout
Agora: ✅ Checkout funciona com ou sem login!

---

## 🛠️ Mudanças Implementadas

### 1. **API de Checkout Atualizada** (`app/api/checkout/create/route.ts`)

#### Antes:
```typescript
// Bloqueava se não tivesse login
const { user } = await supabaseAuth.auth.getUser();
if (!user) {
  return error 401; // ❌ Bloqueado!
}
```

#### Agora:
```typescript
// Aceita user_id opcional no body
const { price_id, ref_code, user_id } = body;

// Se user_id fornecido, verifica duplicação
if (user_id) {
  // Check se já tem subscrição...
}

// Continua checkout normalmente!
```

### 2. **CheckoutButton Atualizado** (`components/CheckoutButton.tsx`)

#### Mudanças:
- ✅ Importa `createClientComponentClient` do Supabase
- ✅ Hook `useEffect` busca user_id se estiver logado
- ✅ Envia `user_id` no body do request (se disponível)
- ✅ Se não estiver logado, envia `undefined`

```typescript
useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
      setUserId(user.id); // ✅ Guarda user ID
    }
  });
}, []);

// No checkout:
body: JSON.stringify({
  price_id: priceId,
  user_id: userId || undefined, // ✅ Opcional!
  ...
})
```

---

## 🎨 Fluxos Possíveis

### **Cenário 1: Utilizador Logado**

```
1. User está logado
   ↓
2. CheckoutButton busca user.id
   ↓
3. Envia user_id para API
   ↓
4. API verifica se já tem subscrição
   ↓
5a. Se JÁ TEM → Bloqueia com erro
5b. Se NÃO TEM → Cria checkout
   ↓
6. Subscrição fica associada ao user_id
```

### **Cenário 2: Utilizador Não Logado (Guest)**

```
1. User não está logado
   ↓
2. CheckoutButton não encontra user
   ↓
3. Envia user_id: undefined
   ↓
4. API não verifica duplicação (sem user_id)
   ↓
5. Cria checkout normalmente
   ↓
6. User paga como "guest"
   ↓
7. Subscrição fica no Stripe mas não associada na DB
```

---

## ⚠️ Importante: Associar Subscrição Depois

### Problema:
Se user fizer checkout sem login, a subscrição não fica associada ao user_id na tabela `user_subscriptions`.

### Solução:
Tens duas opções:

#### **Opção A: Exigir Login (Recomendado)**
Bloquear botão "Get Started" se não estiver logado:

```typescript
// No componente da página
const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user);
  });
}, []);

// No render:
{!user ? (
  <button onClick={() => router.push('/login')}>
    Login to Subscribe
  </button>
) : (
  <CheckoutButton ... />
)}
```

#### **Opção B: Associar Depois do Pagamento**
Se user pagar sem login e depois fizer login:
- No webhook, buscar customer_email
- Verificar se user existe com esse email
- Associar subscrição ao user_id

---

## 🧪 Como Testar

### **Teste 1: Com Login**

```bash
# 1. Fazer login na app
# 2. Ir para: https://retrack-delta.vercel.app
# 3. Clicar "Get Started"
# 4. Ver console: user_id sendo enviado
# 5. Completar pagamento
# 6. Ver subscrição na tabela user_subscriptions
```

### **Teste 2: Sem Login (Guest)**

```bash
# 1. Abrir em modo anónimo (incognito)
# 2. Ir para: https://retrack-delta.vercel.app
# 3. Clicar "Get Started" (sem fazer login)
# 4. Ver console: user_id undefined
# 5. Completar pagamento
# 6. Pagamento funciona, mas subscrição não fica na DB
```

### **Teste 3: Duplicação (Com Login)**

```bash
# 1. User logado com subscrição ativa
# 2. Clicar "Get Started" novamente
# 3. Ver erro: "You already have an active subscription"
```

---

## 📝 Recomendação

**Sugiro implementar Opção A:** Exigir login antes de checkout.

### Vantagens:
- ✅ Subscrição sempre associada ao user
- ✅ Previne duplicação
- ✅ User pode ver subscrição no dashboard
- ✅ Facilita suporte (sabemos quem pagou)

### Como implementar:

1. **Na página inicial** (`app/page.tsx`):

```typescript
// Adicionar verificação de auth
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user);
    setLoading(false);
  });
}, []);

// No botão:
{!user ? (
  <button 
    onClick={() => window.location.href = '/login'}
    className="..."
  >
    Login to Get Started
  </button>
) : (
  <CheckoutButton ... />
)}
```

---

## ✅ Status Atual

- [x] Checkout funciona com login
- [x] Checkout funciona sem login
- [x] Duplicação bloqueada (se logado)
- [x] user_id enviado quando disponível
- [ ] UI para exigir login (opcional)
- [ ] Associação retroativa de subscrições (opcional)

---

## 🎉 Conclusão

**Problema resolvido!** Agora o checkout funciona tanto com utilizadores logados quanto não logados.

Se quiseres garantir que todas as subscrições ficam associadas aos users, implementa a verificação de auth na UI (Opção A recomendada). 🚀
