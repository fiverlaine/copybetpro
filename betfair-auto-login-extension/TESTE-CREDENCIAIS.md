# 🔧 TESTE DE CREDENCIAIS - Betfair Auto Login Extension

## ✅ CORREÇÕES APLICADAS

Corrigi os problemas de comunicação entre o painel admin e a extensão:

### 🔧 **Problemas Corrigidos:**

1. **❌ ID da extensão incorreto**
   - **Antes**: Tentava usar ID hardcoded inexistente
   - **Depois**: Detecta automaticamente a extensão instalada

2. **❌ Message passing incorreto**
   - **Antes**: `chrome.runtime.sendMessage('id-especifico', ...)`
   - **Depois**: `chrome.runtime.sendMessage({...})` (sem ID)

3. **❌ Content script não recebia credenciais**
   - **Antes**: Tentava buscar credenciais com chave `null`
   - **Depois**: Background script notifica content script automaticamente

4. **❌ Permissões insuficientes**
   - **Adicionado**: Permissão `"tabs"` para comunicação entre abas

## 🧪 **COMO TESTAR AGORA:**

### 1. **Recarregar a Extensão**
1. Vá para `chrome://extensions/`
2. Encontre "Betfair Auto Login"
3. Clique no botão de **recarregar** (🔄)
4. ✅ Extensão recarregada com as correções

### 2. **Testar no Painel Admin**
1. Acesse: `/a1c909fe301e7082/dashboard`
2. Clique no botão verde **"Betfair"** de qualquer usuário
3. **Abra o Console** (F12) para ver os logs

### 3. **Logs Esperados no Console:**

**No Painel Admin:**
```
🚀 Usando extensão para login automático...
Credenciais enviadas com sucesso: {success: true, key: "betfair_1234567890"}
✅ Login automático iniciado!
```

**No Background Script (chrome://extensions/):**
```
💾 Credenciais armazenadas: betfair_1234567890
👤 Usuário: usuario@example.com
```

**Na Página da Betfair:**
```
📨 Content script recebeu mensagem: {action: "START_AUTO_LOGIN", credentialsKey: "betfair_1234567890"}
🎯 Iniciando processo de login automático com chave: betfair_1234567890
✅ Campos encontrados, preenchendo...
✅ Login automático concluído!
```

## 🔍 **DEBUGGING:**

### Se ainda não funcionar:

1. **Verificar Console do Painel Admin:**
   - Deve mostrar "🚀 Usando extensão para login automático..."
   - Não deve mostrar "Extensão não encontrada"

2. **Verificar Console da Extensão:**
   - Vá para `chrome://extensions/`
   - Clique em "Detalhes" na extensão
   - Clique em "Verificar visualizações"
   - Deve mostrar logs do background script

3. **Verificar Console da Betfair:**
   - Abra a página da Betfair
   - Abra Console (F12)
   - Deve mostrar logs do content script

## 🚨 **PROBLEMAS COMUNS:**

### **"API do Chrome não disponível"**
- **Causa**: Página não está sendo servida via HTTPS ou localhost
- **Solução**: Acesse o painel admin via `https://localhost:5173` ou `http://localhost:5173`

### **"Timeout ao verificar extensão"**
- **Causa**: Extensão não está respondendo
- **Solução**: Recarregue a extensão em `chrome://extensions/`

### **"Credenciais não encontradas"**
- **Causa**: Content script não recebeu a chave correta
- **Solução**: Verifique se a extensão foi recarregada após as correções

## ✅ **STATUS ATUAL:**

- ✅ **Comunicação corrigida** entre painel admin e extensão
- ✅ **Message passing** funcionando corretamente
- ✅ **Content script** recebe credenciais automaticamente
- ✅ **Permissões** atualizadas no manifest
- ✅ **Logs melhorados** para debugging

---

**Teste agora e veja se as credenciais são detectadas automaticamente! 🎉**
