# 🚀 Guia de Deploy na Netlify - Web Betfair

## ✅ Checklist de Preparação

- [x] Arquivo `netlify.toml` configurado
- [x] Arquivo `public/_redirects` para SPA routing
- [x] `.gitignore` atualizado
- [x] Build script configurado (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Netlify
- [ ] Repositório Git configurado

---

## 📋 Passo a Passo para Deploy

### 1️⃣ **Preparar Repositório Git**

Se ainda não iniciou o Git:

```bash
cd web-betfair
git init
git add .
git commit -m "Initial commit - Ready for Netlify deploy"
```

**⚠️ IMPORTANTE:** Crie um repositório no GitHub/GitLab e faça push:

```bash
git remote add origin https://github.com/seu-usuario/web-betfair.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ **Deploy na Netlify**

#### Opção A: Via Interface da Netlify (Recomendado)

1. **Acesse:** [app.netlify.com](https://app.netlify.com)
2. **Clique em:** "Add new site" → "Import an existing project"
3. **Conecte seu repositório:** GitHub/GitLab/Bitbucket
4. **Selecione:** O repositório `web-betfair`
5. **Configurações de Build:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (deixe vazio)

#### Opção B: Via Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login na Netlify
netlify login

# Deploy do site
cd web-betfair
netlify deploy --prod
```

---

### 3️⃣ **Configurar Variáveis de Ambiente**

**⚠️ CRÍTICO:** Sem essas variáveis, o Supabase não funcionará!

#### Na interface da Netlify:

1. Vá para: **Site settings** → **Environment variables**
2. Adicione as seguintes variáveis:

| Key | Value | Onde encontrar |
|-----|-------|----------------|
| `VITE_SUPABASE_URL` | `https://axjcrpnjckjewqadqfpk.supabase.co` | Painel do Supabase → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (sua chave) | Painel do Supabase → Settings → API |

**📝 Nota:** As chaves já estão com fallback hardcoded no código, mas é **altamente recomendado** usar variáveis de ambiente para produção.

#### Via CLI:

```bash
netlify env:set VITE_SUPABASE_URL "https://axjcrpnjckjewqadqfpk.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "sua_chave_aqui"
```

---

### 4️⃣ **Redesenhar o Site**

Após configurar as variáveis de ambiente:

1. **Trigger a rebuild:**
   - Na interface: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
   - Via CLI: `netlify deploy --prod --build`

---

## 🔧 Configurações Importantes

### Arquivo `netlify.toml` (Já Criado)

O arquivo configura:
- ✅ Comando de build
- ✅ Diretório de publicação
- ✅ Redirecionamentos para SPA
- ✅ Headers de segurança
- ✅ Cache para assets

### Arquivo `public/_redirects` (Já Criado)

Garante que todas as rotas do React Router funcionem:
```
/*    /index.html   200
```

---

## 🌐 URLs do Projeto

Após o deploy, você terá:

- **URL Aleatória:** `https://random-name-12345.netlify.app`
- **Domínio Customizado:** Configure em Site settings → Domain management

### Rotas Importantes:

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para `/dashboard` ou `/login` |
| `/login` | Login de usuários |
| `/register` | Registro de novos usuários |
| `/dashboard` | Painel do usuário |
| `/settings` | Configurações do usuário |
| `/a1c909fe301e7082` | 🔐 Login de administrador |
| `/a1c909fe301e7082/dashboard` | 🔐 Painel administrativo |

---

## 🔒 Segurança - Painel Admin

⚠️ **ATENÇÃO:** O painel admin usa rota oculta com credenciais hardcoded:

- **Rota:** `/a1c909fe301e7082`
- **Email:** `admin@gmail.com`
- **Senha:** `Matematica123*`

### Recomendações de Segurança:

1. **Não compartilhe** a URL do painel admin publicamente
2. **Considere** adicionar autenticação adicional em produção
3. **Implemente** logs de acesso ao painel admin
4. **Altere** a rota e credenciais antes de produção (se necessário)

---

## 📊 Monitoramento

### Analytics (Opcional)

Configure na Netlify:
- **Site settings** → **Analytics** → **Enable analytics**

### Logs

Acesse logs em tempo real:
- **Deploys** → Selecione um deploy → **Deploy log**
- **Functions** → **Function log** (se tiver serverless functions)

---

## 🐛 Solução de Problemas Comuns

### Erro: "Page not found" ao acessar rotas

**Causa:** Falta configuração de SPA routing  
**Solução:** Arquivo `_redirects` ou `netlify.toml` já está configurado

### Erro: "Failed to fetch" no Supabase

**Causa:** Variáveis de ambiente não configuradas  
**Solução:** Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Erro de Build

**Causa:** Dependências faltando ou erros de TypeScript  
**Solução:** 
```bash
npm install
npm run build
```
Corrija erros localmente antes de fazer push

### Rota Admin não funciona

**Causa:** Caracteres especiais na URL  
**Solução:** A rota `/a1c909fe301e7082` funciona normalmente, teste diretamente

---

## 🔄 Atualizações Futuras

Toda vez que fizer alterações:

```bash
# 1. Commitar alterações
git add .
git commit -m "Descrição das alterações"

# 2. Push para o repositório
git push origin main

# 3. Netlify faz deploy automático!
```

---

## 📝 Notas Importantes

### Banco de Dados (Supabase)

- ✅ **Não precisa** de configuração adicional
- ✅ **Funciona** diretamente via API
- ⚠️ **Certifique-se** que as políticas RLS estão corretas
- ⚠️ **URL e chave** já estão com fallback no código

### Extensão do Chrome

- ❌ **NÃO será deployada** na Netlify
- 📦 A extensão (`betfair-auto-login-extension/`) deve ser instalada localmente
- 🔗 Funciona **independentemente** do deploy

### Performance

- ✅ Netlify CDN global
- ✅ Cache configurado para assets
- ✅ Headers de segurança aplicados
- ✅ Compressão automática

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Site carrega corretamente
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Dashboard exibe dados do Supabase
- [ ] Configurações salvam no banco
- [ ] Painel admin (`/a1c909fe301e7082`) funciona
- [ ] Todas as rotas funcionam (sem 404)
- [ ] Mobile responsivo funciona
- [ ] Variáveis de ambiente configuradas
- [ ] SSL/HTTPS ativo (automático na Netlify)

---

## 🆘 Suporte

Se encontrar problemas:

1. **Logs da Netlify:** Veja os logs de build e deploy
2. **Console do Browser:** F12 → Console para erros JavaScript
3. **Network Tab:** F12 → Network para erros de API
4. **Supabase Dashboard:** Verifique queries e tabelas

---

**Deploy configurado e pronto! 🚀**

**Última atualização:** 16 de Outubro de 2025

