# Sales Page - Design Improvements

## ✅ O que foi melhorado

### 1. **Design Minimalista**
- ❌ Removidos gradientes coloridos excessivos
- ✅ Design limpo com fundo escuro e bordas sutis
- ✅ Cards de métricas com estilo minimalista (apenas texto e ícones cinzentos)
- ✅ Espaçamentos reduzidos e mais compactos
- ✅ Cores neutras (cinza/branco) com destaques apenas em lucro/perda (verde/vermelho)

### 2. **Imagens dos Produtos**
- ✅ Cada venda agora mostra a imagem do produto
- ✅ Imagem com 64x64px, arredondada, ao lado esquerdo
- ✅ Placeholder elegante quando não há imagem (ícone Package)
- ✅ Campo `product_image` adicionado à tabela sales

### 3. **Seleção de Produtos do Stock**
- ✅ Modal dividido em 2 colunas:
  - **Esquerda**: Lista de produtos disponíveis em stock (não vendidos)
  - **Direita**: Formulário de detalhes da venda
- ✅ Cada produto mostra:
  - Imagem
  - Título
  - Preço de compra
- ✅ Clica num produto para selecionar
- ✅ Preço de venda pré-preenchido automaticamente (+20% markup)
- ✅ Produto é marcado como "sold" automaticamente ao registar venda
- ❌ Não é possível criar produtos novos — apenas vender do stock existente

### 4. **Lista de Vendas Redesenhada**
- ✅ Layout horizontal compacto com imagem à esquerda
- ✅ Cards mais finos e limpos
- ✅ Grid responsivo com métricas (Sale Price, Profit, Margin, ROI)
- ✅ Botão delete apenas visível no hover
- ✅ Badge da plataforma discreto
- ✅ Data e custos em texto pequeno cinzento

### 5. **Cores & Estilo**
- ✅ Fundo: gradient dark (gray-900 → gray-800)
- ✅ Cards: bg-white/5 com border-white/10
- ✅ Hover: border-white/20 (subtil)
- ✅ Botão principal: indigo-600 (em vez de verde vibrante)
- ✅ Lucro positivo: verde, negativo: vermelho
- ✅ Textos: branco para títulos, gray-400 para labels, gray-500 para secundário

## 📝 Schema Atualizado

A tabela `sales` agora tem o campo `product_image`:

```sql
ALTER TABLE sales ADD COLUMN IF NOT EXISTS product_image TEXT;
```

Ou execute o ficheiro completo: `supabase/migrations/create_sales_table.sql`

## 🔄 Fluxo de Uso

### Registar Venda Manual (Record Sale):
1. Clica em "Record Sale"
2. **Seleciona um produto da lista de stock** (lado esquerdo)
3. Preenche:
   - Sale Price (pré-preenchido com +20%)
   - Platform (Vinted, OLX, etc.)
   - Shipping Cost (opcional)
   - Platform Fee (opcional)
   - Sale Date
4. Vê preview dos cálculos (Profit, Margin, ROI)
5. Clica "Record Sale"
6. ✅ Produto marcado como "sold" automaticamente
7. ✅ Venda aparece no histórico com imagem

### Vender da página Stock (Mark as Sold):
1. Na página Stock, clica "Mark as Sold" num produto
2. Preenche sale price e date
3. Clica confirmar
4. ✅ Produto marcado como sold
5. ✅ **Venda criada automaticamente** em Sales com imagem

## 🎨 Comparação Visual

### Antes:
- ❌ Cores muito vibrantes (verde, roxo, laranja intensos)
- ❌ Cards grandes com gradientes
- ❌ Sem imagens dos produtos
- ❌ Criação manual de produtos no modal

### Depois:
- ✅ Design minimalista e limpo
- ✅ Cores neutras com destaques subtis
- ✅ Imagens dos produtos visíveis
- ✅ Seleção inteligente do stock existente
- ✅ Modal split-screen elegante

## 🚀 Próximos Passos

1. **Execute o SQL no Supabase** para adicionar o campo `product_image`:
   ```sql
   ALTER TABLE sales ADD COLUMN IF NOT EXISTS product_image TEXT;
   ```

2. **Reinicie o servidor**:
   ```powershell
   npm run dev
   ```

3. **Teste o novo fluxo**:
   - Adicione produtos no Stock
   - Vá para Sales → Record Sale
   - Selecione um produto da lista
   - Registe a venda
   - Verifique que aparece com imagem

## ✨ Benefícios

- 🎯 Design mais profissional e moderno
- 👁️ Visualização imediata dos produtos vendidos
- 🚀 Fluxo mais rápido (selecionar em vez de criar)
- 📊 Melhor tracking do inventário
- ✅ Sincronização automática Stock ↔ Sales
