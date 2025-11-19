# ⚡ TESTE RÁPIDO - Login Automático

## 🎯 3 Passos Simples

### 1️⃣ Recarregar Extensão (30 segundos)

```
1. Abra: chrome://extensions/
2. Encontre: "Exchange Auto Login"
3. Clique: 🔄 (botão recarregar)
4. Verifique: Versão 1.2.0
```

### 2️⃣ Recompilar Projeto (se necessário)

```bash
# Se o painel estiver rodando, reinicie:
Ctrl+C
npm run dev
```

### 3️⃣ Testar Login Automático

```
1. Acesse: http://localhost:5173/a1c909fe301e7082/dashboard
2. Clique em qualquer botão: Betfair / Bolsa / FullTBet
3. Observe: Nova aba abrindo
4. Resultado: Login automático deve funcionar!
```

---

## ✅ Checklist Visual

### Betfair
- [ ] Cliquei no botão verde "Betfair"
- [ ] Nova aba abriu com URL: `betfair.bet.br#autologin=...`
- [ ] Campos preenchidos automaticamente
- [ ] Botão de login clicado sozinho
- [ ] Notificação verde apareceu
- [ ] **STATUS: ✅ FUNCIONOU**

### Bolsa de Apostas
- [ ] Cliquei no botão azul "Bolsa"
- [ ] Nova aba abriu com URL: `bolsadeaposta.bet.br/b/exchange?autologin=...`
- [ ] Popup 18+ fechou automaticamente (se apareceu)
- [ ] Campos preenchidos automaticamente
- [ ] Botão de login clicado sozinho
- [ ] Notificação verde apareceu
- [ ] **STATUS: ✅ FUNCIONOU**

### FullTBet
- [ ] Cliquei no botão roxo "FullTBet"
- [ ] Nova aba abriu com URL: `fulltbet.bet.br/b/exchange?autologin=...`
- [ ] Popup 18+ fechou automaticamente (se apareceu)
- [ ] Campos preenchidos automaticamente
- [ ] Botão de login clicado sozinho
- [ ] Notificação verde apareceu
- [ ] **STATUS: ✅ FUNCIONOU**

---

## 🔍 Logs Esperados (F12 → Console)

```
✅ BOM:
🎯 Betfair Auto Login - Content Script carregado
🔑 Credenciais detectadas via hash: {u: "...", p: "***"}
🎯 Iniciando auto-login para Bolsa/FullTBet
✅ Campos de login encontrados: {...}
🔘 Clicando no botão de login: "entrar"
✅ Auto-login concluído com sucesso!
🧹 Credenciais removidas do sessionStorage
```

```
❌ RUIM:
⚠️ Nenhuma credencial de autologin encontrada
⚠️ Timeout: formulário de login não encontrado
```

---

## 🐛 Problemas Comuns

### ❌ "Nenhuma credencial encontrada"
**Solução:**
- Verifique se a extensão foi recarregada
- Verifique se a URL tem `#autologin=`
- Verifique se o usuário tem credenciais configuradas

### ❌ "Formulário não encontrado"
**Solução:**
- Aguarde 20 segundos (40 tentativas)
- Verifique se está na página de login
- Recarregue a página e tente novamente

### ❌ "Campos não preenchidos"
**Solução:**
- Abra DevTools (F12) e veja o console
- Verifique se há erros de JavaScript
- Tente novamente em modo anônimo

---

## 📊 Resultado Esperado

| Plataforma | Deve Funcionar? | Tempo Esperado |
|-----------|-----------------|----------------|
| Betfair | ✅ SIM | < 3 segundos |
| Bolsa | ✅ SIM | < 5 segundos |
| FullTBet | ✅ SIM | < 5 segundos |

---

## 🎯 Se TUDO Funcionar

```
✅ Betfair: OK
✅ Bolsa: OK  
✅ FullTBet: OK

🎉 CORREÇÃO 100% CONCLUÍDA!
```

---

## 📞 Se NÃO Funcionar

1. **Tire screenshot** do console (F12)
2. **Anote qual plataforma** está falhando
3. **Copie os logs** do console
4. **Verifique a versão** da extensão (deve ser 1.2.0)

---

## 📚 Documentação Completa

Para detalhes técnicos, consulte:

- **RESUMO-CORRECAO-LOGIN.md** - Resumo executivo
- **CORRECAO-LOGIN-MULTIPLOS-SITES.md** - Detalhes técnicos
- **GUIA-TESTE-COMPLETO.md** - Guia completo de testes
- **ANTES-DEPOIS.md** - Comparação visual

---

**Tempo total de teste:** ~5 minutos  
**Dificuldade:** ⭐ Muito Fácil  
**Versão:** 1.2.0

