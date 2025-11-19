# 🚀 Exchange Auto Login Extension

Extensão para Chrome/Firefox que automatiza o login em **Betfair**, **Bolsa de Apostas** e **FullTBet** via painel administrativo.

## ✨ Funcionalidades

- ✅ **Login Automático em 3 Sites**: Betfair, Bolsa de Apostas e FullTBet
- 🔗 **Integração com Painel Admin**: Comunica diretamente com o painel administrativo
- 🔒 **Segurança**: Credenciais via sessionStorage (não persistente)
- 📱 **Interface Amigável**: Popup com status e controles
- 🎯 **Detecção Inteligente**: Seletores robustos que funcionam em diferentes layouts
- 🔔 **Feedback Visual**: Notificações coloridas de sucesso/aviso/erro
- 🤖 **Popup 18+ Automático**: Fecha automaticamente popups de confirmação de idade

## 📦 Instalação

### 1. Gerar Ícones

Primeiro, abra o arquivo `generate-icons.html` no navegador e baixe os ícones PNG:

1. Abra `generate-icons.html` no navegador
2. Clique em "Baixar" para cada tamanho (16px, 48px, 128px)
3. Salve os arquivos como:
   - `icons/icon16.png`
   - `icons/icon48.png`
   - `icons/icon128.png`

### 2. Instalar no Chrome

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" (canto superior direito)
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `betfair-auto-login-extension`
5. A extensão aparecerá na lista de extensões

### 3. Instalar no Firefox

1. Abra o Firefox e vá para `about:debugging`
2. Clique em "Este Firefox"
3. Clique em "Carregar complemento temporário"
4. Selecione o arquivo `manifest.json` da pasta da extensão

## 🎯 Como Usar

### 1. No Painel Administrativo

1. Acesse o painel admin: `/a1c909fe301e7082/dashboard`
2. Configure o tipo de exchange do usuário (Betfair, Bolsa ou FullTBet)
3. Na tabela de usuários, clique no botão verde com o nome do exchange
4. A extensão detectará automaticamente e:
   - Armazenará as credenciais no sessionStorage
   - Abrirá o site em nova aba
   - Fechará popup 18+ (se houver)
   - Preencherá os campos automaticamente
   - Clicará no botão de login

### 2. Feedback Visual

A extensão mostra notificações coloridas no canto superior direito:
- **🟢 Verde**: Login realizado com sucesso
- **🟠 Laranja**: Aviso (formulário não encontrado, aguarde)
- **🔴 Vermelho**: Erro durante o processo

### 3. Popup da Extensão

Clique no ícone da extensão para ver:
- **Status**: Extensão ativa/inativa
- **Versão**: 1.1.0
- **Sites suportados**: Betfair, Bolsa e FullTBet
- **Botões**: Testar conexão e abrir sites

## 🔧 Arquitetura Técnica

### Arquivos Principais

```
betfair-auto-login-extension/
├── manifest.json          # Configuração da extensão (Manifest V3)
├── background.js          # Service Worker para comunicação
├── content-script.js      # Script que roda na página da Betfair
├── popup.html            # Interface do popup
├── popup.js              # Lógica do popup
├── icons/                # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── generate-icons.html   # Gerador de ícones PNG
└── README.md            # Este arquivo
```

### Fluxo de Funcionamento Unificado

**Todas as plataformas agora usam o mesmo método via hash na URL:**

1. **Admin clica no botão** no painel administrativo (Betfair/Bolsa/FullTBet)
2. **Credenciais codificadas** em Base64 e inseridas no hash da URL
3. **Nova aba abre** com `https://plataforma.com#autologin=<base64>`
4. **Content script detecta** o hash e decodifica as credenciais
5. **Salva no sessionStorage** para persistir durante navegação
6. **Remove hash da URL** (segurança - usando history.replaceState)
7. **Fecha popup 18+** automaticamente (se houver - Bolsa/FullTBet)
8. **Preenche campos** usando seletores específicos do Angular
9. **Usa setter nativo** para contornar proteções de frameworks
10. **Dispara eventos completos** (input + change + blur) para frameworks
11. **Clica no botão** de login automaticamente
12. **Remove credenciais** do sessionStorage após login bem-sucedido

**Vantagens do método unificado:**
- ✅ Mais confiável que sessionStorage direto
- ✅ Funciona mesmo com redirecionamentos
- ✅ Hash removido da URL após leitura
- ✅ Persistência via sessionStorage durante sessão
- ✅ Mesmo código para todas as plataformas

### Comunicação

```javascript
// Painel Admin → Extensão
chrome.runtime.sendMessage('extension-id', {
  action: 'STORE_CREDENTIALS',
  username: 'user@example.com',
  password: 'password123'
});

// Extensão → Content Script
chrome.runtime.sendMessage({
  action: 'START_AUTO_LOGIN',
  credentialsKey: 'betfair_1234567890'
});
```

## 🔒 Segurança

### Medidas de Segurança

- ✅ **Sem Persistência**: SessionStorage é limpo após o login
- ✅ **Limpeza Automática**: Credenciais removidas imediatamente após uso
- ✅ **Domínios Restritos**: Funciona apenas em domínios específicos
- ✅ **Base64 no Hash**: Betfair usa hash temporário (limpo pelo navegador)
- ✅ **SessionStorage**: Bolsa/FullTBet usam sessionStorage (não sobrevive ao fechar aba)

### Permissões

```json
{
  "permissions": [
    "storage",      // Para armazenar credenciais temporariamente
    "activeTab",    // Para detectar aba ativa
    "scripting"     // Para injetar content script
  ],
  "host_permissions": [
    "https://www.betfair.bet.br/*",         // Betfair
    "https://www.bolsadeaposta.bet.br/*",   // Bolsa de Apostas
    "https://www.fulltbet.bet.br/*",        // FullTBet
    "http://localhost:*/*"                  // Painel admin local
  ]
}
```

## 🐛 Solução de Problemas

### Extensão Não Detectada

**Problema**: Painel admin não detecta a extensão
**Solução**: 
1. Verifique se a extensão está instalada e ativa
2. Recarregue a página do painel admin
3. Verifique o console do navegador (F12) para erros

### Login Não Funciona

**Problema**: Campos não são preenchidos automaticamente
**Solução**:
1. Verifique se está na página correta do exchange
2. Aguarde até 15 segundos para os campos carregarem
3. Abra o console (F12) e verifique os logs:
   - `🔄 Tentativa X/30 de auto-login...`
   - `✅ Campos de login encontrados...`
4. Se necessário, inspecione os campos e atualize os seletores em `content-script.js`

### Popup 18+ Não Fecha

**Problema**: O popup de confirmação de idade não fecha automaticamente
**Solução**:
1. Inspecione o botão "SIM" do popup
2. Adicione o seletor correto em `autoFillBolsaFull()` → `clickPopupIfPresent()`
3. Exemplo: `'button.novo-seletor'`

### Erro de Permissão

**Problema**: "Extension not found" ou erro de permissão
**Solução**:
1. Verifique se a extensão tem permissões para o domínio
2. Reinicie o navegador
3. Reinstale a extensão se necessário

## 🔄 Atualizações

### Versão 1.2.0 (Atual) ⭐ NOVO - 23/10/2025
- ✅ **Método unificado via hash**: Todas as plataformas usam hash na URL (mais confiável)
- ✅ **Setter nativo do HTML**: Contorna proteções de frameworks Angular/React
- ✅ **Eventos completos**: input + change + blur para máxima compatibilidade
- ✅ **Detecção de NgZone**: Integração inteligente com Angular quando disponível
- ✅ **Seletores baseados em HTML real**: Otimizado para formControlName do Angular
- ✅ **Timeout aumentado**: 20 segundos (40 tentativas) para aguardar página
- ✅ **Logs reduzidos**: Apenas a cada 5 tentativas para não poluir console
- ✅ **Múltiplas execuções**: Tenta em 500ms, 2s e 4s para garantir sucesso
- ✅ **Hash removido da URL**: Segurança aprimorada após leitura

### Versão 1.1.0
- ✅ **Suporte a 3 sites**: Betfair, Bolsa de Apostas e FullTBet
- ✅ **Seletores robustos**: 20+ seletores diferentes para campos de login
- ✅ **Detecção de visibilidade**: Não preenche campos ocultos
- ✅ **Popup 18+ automático**: Fecha automaticamente popups de idade
- ✅ **Feedback colorido**: Verde/Laranja/Vermelho para diferentes estados
- ✅ **Logs detalhados**: Console mostra cada tentativa de login
- ✅ **Eventos múltiplos**: `input` + `change` para compatibilidade com frameworks

### Versão 1.0.0
- ✅ Login automático na Betfair
- ✅ Integração com painel admin
- ✅ Interface popup
- ✅ Segurança com credenciais temporárias

### Próximas Versões
- 🔄 Suporte a mais exchanges
- 🔄 Detecção de 2FA
- 🔄 Retry inteligente com backoff exponencial
- 🔄 Dashboard de logs interno

## 📝 Logs e Debug

### Console do Navegador

Para debugar, abra o console (F12) e procure por:

```
🚀 Betfair Auto Login Extension - Background Script iniciado
🎯 Betfair Auto Login - Content Script carregado
🔑 Credenciais encontradas no sessionStorage
🎯 Iniciando auto-login para Bolsa/FullTBet
🔄 Tentativa 1/30 de auto-login...
✅ Campos de login encontrados, preenchendo...
🔘 Clicando no botão de login
✅ Auto-login concluído com sucesso!
```

### Logs da Extensão

- **Background Script**: Console da extensão (chrome://extensions/)
- **Content Script**: Console da página da Betfair
- **Popup**: Console do popup da extensão

## 🤝 Suporte

Para problemas ou dúvidas:

1. Verifique os logs no console do navegador
2. Teste a conexão no popup da extensão
3. Verifique se todas as permissões estão concedidas
4. Reinstale a extensão se necessário

## 📄 Documentação Adicional

- 📖 [CORRECAO-LOGIN-MULTIPLOS-SITES.md](./CORRECAO-LOGIN-MULTIPLOS-SITES.md) - Detalhes técnicos da v1.1.0
- 📝 [INSTRUCOES-INSTALACAO.md](./INSTRUCOES-INSTALACAO.md) - Guia passo a passo de instalação

## 📊 Comparação de Versões

| Recurso | v1.0.0 | v1.1.0 |
|---------|--------|--------|
| Sites suportados | 1 | 3 |
| Seletores de login | 3 | 20+ |
| Timeout | 10s | 15s |
| Feedback visual | 1 cor | 3 cores |
| Popup 18+ | ❌ | ✅ |
| Logs detalhados | ❌ | ✅ |

## 📄 Licença

Desenvolvido para o Painel Administrativo SigaTrader.

---

**Desenvolvido com ❤️ para automatizar o login em múltiplos exchanges**  
**Versão 1.1.0** - Outubro 2025
