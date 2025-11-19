# 🧪 GUIA COMPLETO DE TESTE - Auto-Login Multi-Plataforma

## 📋 Pré-requisitos

1. ✅ Extensão instalada no Chrome
2. ✅ Painel admin aberto (localhost ou produção)
3. ✅ Pelo menos 1 usuário cadastrado com credenciais configuradas
4. ✅ Acesso à internet

## 🔄 Passo 1: Recarregar a Extensão

Sempre que houver alterações no código da extensão, é necessário recarregá-la:

1. **Abra o Chrome** e acesse: `chrome://extensions/`
2. **Localize** "Exchange Auto Login"
3. **Clique no ícone de recarregar** 🔄 (canto inferior direito do card da extensão)
4. ✅ **Confirmação**: Extensão deve recarregar sem erros

## 🎯 Passo 2: Configurar Usuário de Teste

### No Painel Admin

1. **Acesse**: `http://localhost:5173/a1c909fe301e7082/dashboard`
   - Email: `admin@gmail.com`
   - Senha: `Matematica123*`

2. **Escolha um usuário** ou crie um novo com:
   - Nome completo
   - Email
   - Telefone
   - **Exchange Type**: Escolha uma das opções:
     - `betfair` - Para testar Betfair
     - `bolsa` - Para testar Bolsa de Apostas
     - `fulltbet` - Para testar FullTBet

3. **Configure as credenciais de teste**:
   - Conta da Exchange: `usuario_teste`
   - Senha da Exchange: `senha_teste123`
   - Stake: `10.00`
   - Status: Ativado ✅

4. **Salve as configurações**

## 🧪 Passo 3: Testar Login Automático

### 3.1 Preparação

1. **Abra DevTools** (F12) no navegador
2. **Vá para a aba Console**
3. **Deixe o console aberto** para ver os logs

### 3.2 Testando Betfair

1. **No painel admin**, clique no botão **verde "Betfair"** do usuário
2. **Nova aba deve abrir** com: `https://www.betfair.bet.br#autologin=...`
3. **Observe os logs no console**:

```
✅ Logs esperados:
🎯 Betfair Auto Login - Content Script carregado
🔑 Credenciais detectadas via hash: {u: "usuario_teste", p: "***"}
🔑 Credenciais de auto-login detectadas, iniciando processo...
✅ Campos encontrados, preenchendo...
🔘 Clicando no botão de login
✅ Auto-login concluído com sucesso!
🧹 Credenciais removidas do sessionStorage
```

4. **Resultado esperado**:
   - ✅ Campos preenchidos automaticamente
   - ✅ Botão clicado automaticamente
   - ✅ Notificação verde "Login automático acionado!"
   - ✅ Hash removido da URL

### 3.3 Testando Bolsa de Apostas

1. **Configure o usuário** com `exchange_type = 'bolsa'`
2. **No painel admin**, clique no botão **azul "Bolsa"**
3. **Nova aba deve abrir** com: `https://bolsadeaposta.bet.br/b/exchange#autologin=...`
4. **Observe os logs**:

```
✅ Logs esperados:
🎯 Betfair Auto Login - Content Script carregado
🔑 Credenciais detectadas via hash: {u: "usuario_teste", p: "***"}
🎯 Iniciando auto-login para Bolsa/FullTBet
🔄 Tentativa 1/40 de auto-login...
✅ Campos de login encontrados: {user: "input login-input...", pass: "input login-input...", btn: "btn login-btn..."}
🔘 Clicando no botão de login: "entrar"
✅ Auto-login concluído com sucesso!
🧹 Credenciais removidas do sessionStorage
```

5. **Resultado esperado**:
   - ✅ Campos preenchidos automaticamente
   - ✅ Botão de login clicado
   - ✅ Notificação verde
   - ✅ Login processado

### 3.4 Testando FullTBet

1. **Configure o usuário** com `exchange_type = 'fulltbet'`
2. **No painel admin**, clique no botão **roxo "FullTBet"**
3. **Nova aba deve abrir** com: `https://fulltbet.bet.br/b/exchange#autologin=...`
4. **Observe os mesmos logs** do teste da Bolsa
5. **Resultado esperado**: Idêntico ao teste da Bolsa

## 🐛 Troubleshooting (Resolução de Problemas)

### ❌ Problema: Credenciais não são detectadas

**Logs no console:**
```
⚠️ Nenhuma credencial de autologin encontrada
```

**Solução:**
1. Verifique se a URL contém `#autologin=` ao abrir
2. Verifique se você recarregou a extensão após as alterações
3. Verifique se o usuário tem credenciais configuradas

---

### ❌ Problema: Campos não são encontrados

**Logs no console:**
```
🔄 Tentativa 1/40 de auto-login...
🔄 Tentativa 2/40 de auto-login...
...
⚠️ Timeout: formulário de login não encontrado
```

**Solução:**
1. Verifique se a página carregou completamente
2. Verifique se você está na página de login (não em outra página do site)
3. Abra DevTools → Elements e procure por:
   - `input[formcontrolname="login"]`
   - `input[formcontrolname="password"]`
   - `button.login-btn`
4. Se os elementos existem mas não são detectados:
   - Verifique se estão visíveis (não `display: none`)
   - Aguarde mais tempo para a página carregar

---

### ❌ Problema: Campos preenchidos mas botão não clicado

**Logs no console:**
```
✅ Campos de login encontrados: {...}
⚠️ Botão de login não encontrado, tentando submit
```

**Solução:**
1. O sistema tentará fazer submit do formulário automaticamente
2. Se não funcionar, clique manualmente no botão
3. Reporte o problema com os seletores CSS do botão

---

### ❌ Problema: Extensão não funciona em nenhuma plataforma

**Solução:**
1. **Verifique se a extensão está ativa:**
   - Acesse: `chrome://extensions/`
   - Verifique se "Exchange Auto Login" está ativada
   
2. **Verifique permissões:**
   - A extensão deve ter permissão para:
     - `https://www.betfair.bet.br/*`
     - `https://bolsadeaposta.bet.br/*`
     - `https://fulltbet.bet.br/*`

3. **Reinstale a extensão:**
   - Remova a extensão
   - Reinstale seguindo o guia de instalação

---

### ❌ Problema: Hash não é removido da URL

**Logs no console:**
```
🔑 Credenciais detectadas via hash: {...}
```

**Mas a URL ainda mostra**: `#autologin=...`

**Solução:**
- Isso é normal se `history.replaceState` não estiver disponível
- As credenciais ainda são processadas corretamente
- A segurança não é comprometida (hash será limpo ao navegar)

## 📊 Checklist de Testes

Use este checklist para verificar todas as funcionalidades:

### Betfair
- [ ] URL gerada corretamente com hash
- [ ] Nova aba abre
- [ ] Credenciais detectadas via hash
- [ ] Campos de usuário e senha preenchidos
- [ ] Botão de login clicado automaticamente
- [ ] Notificação verde exibida
- [ ] Hash removido da URL
- [ ] Credenciais removidas do sessionStorage

### Bolsa de Apostas
- [ ] URL gerada corretamente com hash
- [ ] Nova aba abre
- [ ] Credenciais detectadas via hash
- [ ] Popup 18+ clicado (se presente)
- [ ] Campos de login preenchidos
- [ ] Eventos Angular disparados
- [ ] Botão de login clicado automaticamente
- [ ] Notificação verde exibida
- [ ] Credenciais removidas após login

### FullTBet
- [ ] URL gerada corretamente com hash
- [ ] Nova aba abre
- [ ] Credenciais detectadas via hash
- [ ] Popup 18+ clicado (se presente)
- [ ] Campos de login preenchidos
- [ ] Eventos Angular disparados
- [ ] Botão de login clicado automaticamente
- [ ] Notificação verde exibida
- [ ] Credenciais removidas após login

### Segurança
- [ ] Hash removido da URL após leitura
- [ ] Credenciais removidas do sessionStorage após login
- [ ] Senha não aparece em logs (mostrado como ***)
- [ ] Extensão só funciona nos domínios permitidos

## 🎯 Testes Avançados

### Teste 1: Múltiplas Tentativas
1. Abra a página da exchange ANTES de clicar no botão
2. Aguarde carregar completamente
3. Agora clique no botão do painel
4. **Resultado esperado**: Login automático deve funcionar mesmo em página já carregada

### Teste 2: Popup 18+
1. Limpe cookies e cache do site
2. Clique no botão da exchange
3. **Resultado esperado**: 
   - Popup 18+ detectado
   - Botão "SIM" clicado automaticamente
   - Login processado após fechar popup

### Teste 3: Navegação Pós-Login
1. Faça login automático
2. Navegue para outra página do site
3. Volte para página de login
4. **Resultado esperado**:
   - Credenciais NÃO devem ser preenchidas novamente
   - Você deve estar autenticado

## 📝 Reportando Problemas

Se encontrar problemas, reporte com:

1. **Plataforma testada**: Betfair / Bolsa / FullTBet
2. **Navegador e versão**: Chrome 120.x
3. **Logs do console**: Copie todos os logs relevantes
4. **Comportamento esperado vs atual**
5. **Screenshots (se possível)**

## ✅ Testes Concluídos com Sucesso

Quando todos os testes passarem:

- ✅ **Betfair**: Login automático funcionando
- ✅ **Bolsa de Apostas**: Login automático funcionando
- ✅ **FullTBet**: Login automático funcionando
- ✅ **Segurança**: Hash e credenciais limpos
- ✅ **UX**: Feedback visual adequado
- ✅ **Performance**: Login em < 5 segundos

## 🎉 Próximos Passos

Após validar todos os testes:

1. **Documente os resultados**
2. **Compartilhe com a equipe**
3. **Deploy em produção** (se aplicável)
4. **Monitore uso real**
5. **Colete feedback dos usuários**

---

**Última atualização**: 23 de Outubro de 2025  
**Versão da extensão**: 1.1.0  
**Status**: ✅ Funcionando em todas as plataformas

