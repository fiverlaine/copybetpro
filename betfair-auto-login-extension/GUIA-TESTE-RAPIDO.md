# ⚡ Guia de Teste Rápido - Login Automático

## 📋 Checklist de Instalação

- [ ] Extensão instalada no Chrome (`chrome://extensions/`)
- [ ] Modo desenvolvedor ativado
- [ ] Extensão carregada da pasta `betfair-auto-login-extension`
- [ ] Ícone da extensão aparece na barra de ferramentas

---

## 🧪 Testes Obrigatórios

### 1️⃣ Teste Betfair

**Objetivo**: Verificar se login automático funciona na Betfair

**Passos**:
1. Acesse o painel admin: `http://localhost:5173/a1c909fe301e7082/dashboard`
2. Localize um usuário com `exchange_type = 'betfair'`
3. Clique no botão verde **"BETFAIR"**
4. Nova aba abrirá automaticamente

**Resultados esperados**:
- ✅ Aba abre com URL: `https://www.betfair.bet.br/#autologin=<base64>`
- ✅ Campos de login são preenchidos automaticamente
- ✅ Botão de login é clicado automaticamente
- ✅ Notificação verde aparece: "✅ Login automático Betfair acionado!"
- ✅ Login é realizado com sucesso

**Console (F12)**:
```
🎯 Betfair Auto Login - Content Script carregado
🔑 Credenciais de auto-login detectadas, iniciando processo…
✅ Login automático Betfair acionado!
```

---

### 2️⃣ Teste Bolsa de Apostas

**Objetivo**: Verificar se login automático funciona na Bolsa de Apostas

**Passos**:
1. No painel admin, configure um usuário com `exchange_type = 'bolsa'`
2. Adicione credenciais de teste:
   - **Conta**: `usuario_teste`
   - **Senha**: `senha123`
3. Clique no botão **"BOLSA"**
4. Nova aba abrirá automaticamente

**Resultados esperados**:
- ✅ Página intermediária de carregamento aparece brevemente
- ✅ Redireciona para `https://bolsadeaposta.bet.br/b/exchange`
- ✅ Popup 18+ (se houver) é fechado automaticamente
- ✅ Campos de login são preenchidos automaticamente
- ✅ Botão de login é clicado automaticamente
- ✅ Notificação verde aparece: "✅ Login automático acionado!"

**Console (F12)**:
```
🎯 Betfair Auto Login - Content Script carregado
🔑 Credenciais encontradas no sessionStorage
🎯 Iniciando auto-login para Bolsa/FullTBet
🔄 Tentativa 1/30 de auto-login...
🔘 Clicando no popup 18+
✅ Campos de login encontrados, preenchendo...
🔘 Clicando no botão de login
✅ Auto-login concluído com sucesso!
```

---

### 3️⃣ Teste FullTBet

**Objetivo**: Verificar se login automático funciona no FullTBet

**Passos**:
1. No painel admin, configure um usuário com `exchange_type = 'fulltbet'`
2. Adicione credenciais de teste
3. Clique no botão **"FULLTBET"**
4. Nova aba abrirá automaticamente

**Resultados esperados**:
- ✅ Mesmo comportamento da Bolsa de Apostas
- ✅ URL: `https://fulltbet.bet.br/b/exchange`
- ✅ Login automático completo

---

## 🔍 Verificação de Problemas Comuns

### ❌ Problema 1: "Formulário de login não encontrado"

**Sintoma**: Notificação laranja aparece após 15 segundos

**O que verificar**:
1. Abra o console (F12) e veja o log de tentativas
2. Verifique se a página carregou completamente
3. Inspecione os campos de login (botão direito → Inspecionar)
4. Compare os seletores no HTML com os do `content-script.js`

**Como corrigir**:
- Se os seletores mudaram, atualize em `autoFillBolsaFull()` no `content-script.js`

---

### ❌ Problema 2: Credenciais não são passadas

**Sintoma**: Página abre mas não preenche

**O que verificar**:
1. Console da nova aba: `sessionStorage.getItem('autoLoginCreds')`
2. Deve retornar algo como: `{"u":"usuario","p":"senha"}`
3. Se retornar `null`, o problema está no `redirectToExchange()` do painel admin

**Como corrigir**:
- Verifique `AdminDashboard.tsx` linha 276-293

---

### ❌ Problema 3: Popup 18+ não fecha

**Sintoma**: Popup de idade permanece na tela

**O que verificar**:
1. Inspecione o botão "SIM" do popup
2. Anote o seletor CSS (ex: `button.mat-button`)
3. Verifique se está na lista de `yesSelectors` em `content-script.js`

**Como corrigir**:
```javascript
const yesSelectors = [
  'button.btn--color',
  'button.mat-mdc-dialog-content button',
  'div.cdk-overlay-pane button',
  'button[mat-dialog-close]',
  'button[class*="dialog"] button',
  'button.seu-novo-seletor', // Adicione aqui
];
```

---

## 📊 Tabela de Status de Teste

| Site | Status | Observações |
|------|--------|-------------|
| Betfair | ⏳ Pendente | |
| Bolsa de Apostas | ⏳ Pendente | |
| FullTBet | ⏳ Pendente | |

**Instruções**: Marque com ✅ após testar com sucesso, ou ❌ se houver problema.

---

## 🎯 Validação Final

Após concluir todos os testes, verifique:

- [ ] Todos os 3 sites testados
- [ ] Login automático funcionando em todos
- [ ] Notificações aparecendo corretamente
- [ ] Console sem erros críticos
- [ ] Credenciais são removidas após uso

---

## 📞 Reportar Problemas

Se encontrar problemas:

1. **Anote**:
   - Site onde ocorreu o erro
   - Mensagem de erro no console
   - Comportamento esperado vs observado

2. **Capture**:
   - Screenshot da notificação
   - Log completo do console (F12)
   - HTML dos campos de login (Inspecionar elemento)

3. **Envie**:
   - Todos os dados acima para análise

---

## ✅ Teste Bem-Sucedido

Se todos os testes passaram:
- ✅ Extensão funcionando perfeitamente!
- ✅ Pronta para uso em produção
- ✅ Faça backup da pasta da extensão

**Próximo passo**: Teste com credenciais reais em ambiente de produção.

---

**Tempo estimado**: 10-15 minutos  
**Última atualização**: Outubro 2025  
**Versão testada**: 1.1.0

