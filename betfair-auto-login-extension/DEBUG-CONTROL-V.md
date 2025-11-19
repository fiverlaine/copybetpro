# 🔍 DEBUG CTRL+V - Betfair Auto Login Extension

## ✅ LOGS MELHORADOS PARA DEBUG!

Adicionei logs detalhados para identificar exatamente onde está o problema na detecção do Ctrl+V.

### 🔧 **Melhorias Implementadas:**

1. **Logs detalhados** de cada tecla pressionada
2. **Suporte para Mac** (Cmd+V além de Ctrl+V)
3. **Detecção dupla** (keydown + paste event)
4. **Logs do clipboard** para ver o conteúdo
5. **Logs de elementos ativos** para debug

## 🧪 **COMO TESTAR COM DEBUG:**

### 1. **Recarregar a Extensão**
1. Vá para `chrome://extensions/`
2. Clique no botão **recarregar** (🔄)

### 2. **Testar no Painel Admin**
1. Acesse: `/a1c909fe301e7082/dashboard`
2. Clique no botão verde **"Betfair"**
3. **Deve aparecer**: "Bookmarklet copiado automaticamente!"

### 3. **Na Página da Betfair - COM CONSOLE ABERTO**
1. **Abra o Console** (F12)
2. **Pressione Ctrl+V** em qualquer lugar da página
3. **Observe os logs** detalhados

## 📊 **LOGS ESPERADOS:**

### **Quando pressionar Ctrl+V:**
```
🔍 Tecla pressionada: v Ctrl: true Shift: false Alt: false
✅ Ctrl+V detectado! Verificando clipboard...
📋 Tentando acessar clipboard...
📋 Conteúdo do clipboard: javascript:(function(){var u='usuario@ex...
🎯 Bookmarklet detectado no clipboard!
🚀 Executando bookmarklet...
✅ Bookmarklet executado com sucesso!
```

### **Se não detectar:**
```
🔍 Tecla pressionada: v Ctrl: false Shift: false Alt: false
```

### **Se clipboard estiver vazio:**
```
✅ Ctrl+V detectado! Verificando clipboard...
📋 Tentando acessar clipboard...
📋 Conteúdo do clipboard: vazio
⚠️ Clipboard não contém bookmarklet válido
```

## 🔍 **POSSÍVEIS PROBLEMAS E SOLUÇÕES:**

### **1. Ctrl+V não detectado:**
- **Log**: `🔍 Tecla pressionada: v Ctrl: false`
- **Solução**: Verifique se está pressionando Ctrl+V corretamente

### **2. Clipboard vazio:**
- **Log**: `📋 Conteúdo do clipboard: vazio`
- **Solução**: O bookmarklet não foi copiado. Teste novamente no painel admin

### **3. Erro de permissão:**
- **Log**: `❌ Erro ao acessar clipboard:`
- **Solução**: Certifique-se que está em HTTPS ou localhost

### **4. Bookmarklet inválido:**
- **Log**: `⚠️ Clipboard não contém bookmarklet válido`
- **Solução**: Verifique se o bookmarklet começa com `javascript:`

## 🚀 **DETECÇÃO DUPLA:**

A extensão agora detecta Ctrl+V de **duas formas**:

1. **Evento keydown** - Detecta quando Ctrl+V é pressionado
2. **Evento paste** - Detecta quando conteúdo é colado

### **Logs do evento paste:**
```
📋 Evento paste detectado!
📋 Verificando clipboard via evento paste...
🎯 Bookmarklet detectado via evento paste!
```

## 🔧 **TESTE MANUAL:**

Se ainda não funcionar, teste manualmente:

1. **Cole o bookmarklet** em um campo de texto
2. **Observe os logs** para ver se detecta
3. **Compare** com o que aparece quando funciona manualmente

## ✅ **PRÓXIMOS PASSOS:**

1. **Recarregue a extensão**
2. **Teste com console aberto**
3. **Compartilhe os logs** que aparecem
4. **Identificaremos** exatamente onde está o problema

---

**Com esses logs detalhados, vamos identificar exatamente o que está acontecendo! 🔍**

**Teste agora e me mostre os logs que aparecem no console.**
