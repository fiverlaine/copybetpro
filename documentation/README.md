# Projeto Betfair - Frontend

## 🎨 Design Moderno e Profissional

Aplicação React + TypeScript com design moderno, profissional e totalmente responsivo, integrada ao Supabase.

### ✨ Características do Design

- **Interface Moderna**: Design glassmorphism com gradientes sutis
- **Cores Sofisticadas**: Paleta baseada em roxo/indigo com acentos em cyan, purple e pink
- **Totalmente Responsivo**: Mobile-first design com adaptação perfeita para todas as telas
- **Animações Suaves**: Transições e animações que melhoram a experiência do usuário
- **Ícones Profissionais**: SVG icons customizados, sem emojis
- **Navegação Intuitiva**: Sidebar para desktop e bottom navigation para mobile

## 🚀 Setup

### Desenvolvimento Local

1. Crie o arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

2. Edite o `.env` e adicione suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

3. Instale as dependências e inicie o servidor de desenvolvimento:
```bash
npm install
npm run dev
```

### Deploy em Produção (Netlify)

📖 **Consulte o guia completo:** [DEPLOY_NETLIFY.md](../DEPLOY_NETLIFY.md)

**Resumo rápido:**
1. Configure variáveis de ambiente na Netlify
2. Conecte seu repositório Git
3. Deploy automático configurado via `netlify.toml`

## 📁 Estrutura do Projeto

```
src/
├── lib/
│   └── supabaseClient.ts        # Cliente Supabase configurado
├── components/
│   ├── PoliciesModal.tsx        # Modal de políticas obrigatórias
│   ├── RealtimeNotification.tsx # Notificações em tempo real
│   └── StrategyHistoryModal.tsx # Modal de histórico mensal de estratégias
├── pages/
│   ├── Login.tsx                # Página de autenticação
│   ├── Register.tsx             # Página de registro de usuários
│   ├── Dashboard.tsx            # Painel principal com overview
│   ├── Strategies.tsx           # Página de estratégias disponíveis
│   ├── Settings.tsx             # Configurações do usuário
│   ├── AdminLogin.tsx           # Login administrativo
│   └── AdminDashboard.tsx       # Painel administrativo
├── App.tsx                      # Componente principal com roteamento
├── index.css                    # Estilos globais e classes utilitárias
└── main.tsx                     # Entry point da aplicação
```

## 🎨 Sistema de Design

### Paleta de Cores

```css
/* Cores Principais */
--color-primary: #6366f1        /* Indigo */
--color-primary-light: #818cf8
--color-primary-dark: #4f46e5

/* Cores de Acento */
--accent-cyan: #06b6d4
--accent-purple: #a855f7
--accent-pink: #ec4899
--accent-orange: #f97316

/* Background */
--bg-dark: #0a0e1a
--bg-darker: #050810
--surface: #111827
--surface-light: #1f2937

/* Status */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Componentes Estilizados

#### Cards com Glassmorphism
```css
.glass-card {
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(55, 65, 81, 1);
  border-radius: 1rem;
}
```

#### Botões Modernos
- **Primary**: Gradiente roxo com glow effect
- **Secondary**: Surface com border hover
- **Outline**: Border colorido com hover suave

#### Inputs com Ícones
Todos os inputs possuem ícones SVG no lado esquerdo e estados de hover/focus bem definidos.

### Animações

- `fade-in`: Entrada suave (0.5s)
- `slide-up`: Desliza de baixo para cima (0.5s)
- `slide-down`: Desliza de cima para baixo (0.5s)
- `scale-in`: Escala com fade (0.3s)
- `pulse-slow`: Pulso lento (3s loop)

## 📱 Páginas e Funcionalidades

### 1. Login (`/login`)
- Formulário de autenticação elegante
- Validação em tempo real
- Mensagens de erro contextualizadas
- **Modal de Políticas Obrigatório**: 
  - Aparece automaticamente se o usuário não aceitou os termos
  - Bloqueia acesso ao sistema até aceitar
  - Modal bloqueante (não pode fechar sem aceitar)
- Link para registro

### 2. Registro (`/register`)
- Formulário de criação de conta
- Campos obrigatórios:
  - Nome completo
  - Email
  - **Telefone** (novo campo para contato)
  - Senha e confirmação
- Validação de senha duplicada
- **Modal de Políticas Obrigatório**: 
  - Aparece após preencher o formulário e clicar em "Criar conta"
  - Usuário deve ler e aceitar os termos para criar a conta
  - Conta só é criada após aceitação dos termos
  - Modal bloqueante (não pode fechar sem aceitar)
- **Formatação Inteligente de Telefone**:
  - Prefixo `+55` fixo
  - Máscara dinâmica `(DD) XXXXX-XXXX`
  - Aceita somente DDD + 9 dígitos (11 dígitos totais)
- Animação de sucesso ao criar conta
- Lista de benefícios visuais

### 3. Dashboard (`/dashboard`)
- Cabeçalho personalizado com saudação
- **Modal de Políticas Obrigatório**: 
  - Verifica se o usuário aceitou os termos ao acessar
  - Bloqueia acesso completo ao dashboard até aceitar
  - Prioridade sobre outros modais (alerta de credenciais)
  - Modal bloqueante (não pode fechar sem aceitar)
- Cards informativos com ícones:
  - Conta da Exchange
  - Senha da Exchange
  - Stake configurado
  - Status do sistema
- **Modal de Alerta de Credenciais**: 
  - Exibido automaticamente quando credenciais estão incorretas
  - Sistema desativado automaticamente até correção
  - Link direto para configurações
  - Só aparece se o usuário já aceitou as políticas
- Seção de credenciais de acesso
- Aviso de segurança

### 4. Estratégias (`/strategies`) 🎯
- **Visualização de Estratégias Disponíveis**: 
  - Grid responsivo com cards de estratégias
  - Informações detalhadas: nome, descrição, percentual de sucesso
  - Barra de progresso visual indicando taxa de sucesso
  - Ícones diferenciados por tipo de estratégia (trending, star, fire)
  - Gradientes coloridos personalizados por estratégia
- **Sistema de Copiar Estratégias**:
  - Botão "Copiar Estratégia" em cada card
  - Atualização automática do campo `selected_strategy` no banco
  - Sincronização em tempo real com a sessão do usuário
  - Feedback visual de estratégia ativa (badge verde)
  - Indicador de estratégia selecionada no card
- **Gerenciamento de Estratégia Ativa**:
  - Banner informativo mostrando estratégia atualmente copiada
  - Botão "Parar de Copiar" para desativar estratégia
  - Validação: usuário não pode copiar outra estratégia sem parar a atual
  - Mensagens de sucesso/erro ao ativar/desativar
- **Histórico Mensal**:
  - Modal detalhado com histórico mensal de cada estratégia
  - Estatísticas: Média Geral, Melhor Mês, Tendência
  - Tabela com evolução mensal ordenada por data
  - Badges de status: Alto (≥70%), Médio (≥50%), Baixo (<50%)
  - Cores diferenciadas por status (verde/amarelo/vermelho)
- **Seção Informativa**:
  - Explicação de como funciona o sistema de copiar estratégias
  - Informações sobre taxa de sucesso histórica
  - Orientações sobre alteração de estratégias

### 5. Configurações (`/settings`)
- **Modal de Políticas Obrigatório**: 
  - Verifica se o usuário aceitou os termos ao acessar
  - Bloqueia acesso às configurações até aceitar
  - Modal bloqueante (não pode fechar sem aceitar)
- **Entrada de Telefone Inteligente**:
  - Formatação automática com prefixo `+55`
  - Aceita apenas DDD + 9 dígitos
  - Validação aplicada antes de salvar
- Formulário organizado em seções:
  - **Informações Pessoais**: Atualização de telefone
  - **Tipo de Exchange**: Seleção entre Betfair, Bolsa ou FullTbet
  - **Credenciais da Exchange**: Conta e senha (adaptadas ao tipo selecionado)
  - **Configurações de Stake**: Campo obrigatório, mínimo R$ 0,01
  - **Status do Sistema**: Toggle switch
- Sistema inteligente de alerta:
  - Remove alerta automaticamente ao alterar credenciais
  - Permite reativação do sistema após correção
- Validação de campos obrigatórios
- Feedback visual de sucesso/erro
- Botões de ação claros

### 6. Painel Admin (`/a1c909fe301e7082`) 🔐
- **Login Administrativo**: Acesso via credenciais específicas
  - Email: `admin@gmail.com`
  - Senha: `Matematica123*`
- **Dashboard Administrativo**: Visualização completa de todos os usuários
  - Tabela expandida com novas colunas:
    - Usuário (nome e email)
    - **Telefone** (com opção de copiar)
    - **Exchange** (badge colorida por tipo: Betfair/Bolsa/FullTbet)
    - Conta da Exchange
    - Senha da Exchange (toggle de visibilidade)
    - Stake configurado
    - Status do sistema
    - Data de cadastro
    - Ações disponíveis
  - **Botão de Alerta**: 
    - Permite marcar credenciais como incorretas
    - Desativa sistema automaticamente
    - Badge visual amarelo para usuários com alerta
    - Toggle ON/OFF para gerenciar alertas
  - Estatísticas em tempo real:
    - Total de usuários
    - Sistemas ativos
    - Usuários com exchange configurada
  - Filtros avançados:
    - Busca por nome, email, telefone ou conta
    - Filtro por status (ativos/inativos)
    - Filtro por exchange configurada
    - Paginação customizável (10-50 usuários por página)
  - Funcionalidades de copiar:
    - Telefone
    - Conta da exchange
    - Senha da exchange
  - Possibilidade de visualizar senhas (toggle por usuário)
  - Botão de acesso direto à exchange com auto-login
  - Design diferenciado em tons de vermelho para indicar área administrativa
  - Botão de atualização de dados
  - Logout seguro do painel admin
  - Avisos de segurança e responsabilidade

## 🔧 Componentes Reutilizáveis

### Navegação
- **Sidebar** (Desktop): Navegação lateral fixa com indicador de página ativa
  - Dashboard
  - **Estratégias** (novo)
  - Configurações
- **MobileNav** (Mobile): Bottom navigation para fácil acesso
  - Dashboard
  - **Estratégias** (novo)
  - Configurações
- **Header**: Cabeçalho adaptável com logo e navegação

### Ícones SVG
Todos os ícones são componentes React otimizados:
- Dashboard, Settings, Logout, User
- Mail, Lock, Key, Currency
- Power, Save, Check, Arrow
- E mais...

## 💾 Banco de Dados

### Tabela `public.users`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único (PK) |
| `email` | text | Email do usuário (único) |
| `full_name` | text | Nome completo |
| `password` | text | Senha em texto |
| `phone` | text | **Telefone do usuário** |
| `exchange_type` | text | **Tipo de exchange (betfair/bolsa/fulltbet)** |
| `betfair_account` | text | Conta da Exchange |
| `betfair_password` | text | Senha da Exchange |
| `stake` | numeric | Valor padrão de stake |
| `system_enabled` | boolean | Status do sistema |
| `selected_strategy` | text | **ID da estratégia selecionada pelo usuário** |
| `account_alert` | boolean | **Alerta de credenciais incorretas** |
| `policies_accepted` | boolean | **Indica se o usuário aceitou os termos de uso** |
| `policies_accepted_at` | timestamp | **Data e hora em que o usuário aceitou as políticas** |
| `created_at` | timestamp | Data de criação |

### Tabela `public.strategies`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único (PK) |
| `name` | text | Nome da estratégia (único) |
| `description` | text | Descrição da estratégia |
| `percentage` | numeric | Taxa de sucesso histórica |
| `icon_type` | text | Tipo de ícone (trending/star/fire) |
| `color_gradient` | text | Classes de gradiente Tailwind |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Data de atualização |

### Tabela `public.strategy_history`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador único (PK) |
| `strategy_id` | uuid | ID da estratégia (FK) |
| `month` | integer | Mês (1-12) |
| `year` | integer | Ano |
| `percentage` | numeric | Taxa de sucesso do mês |
| `created_at` | timestamp | Data de criação |

### ⚠️ Aviso de Segurança

**Importante**: As senhas são armazenadas em texto plano por requisito do projeto. Em ambiente de produção, SEMPRE use hash de senhas (bcrypt, argon2, etc).

## 🛠️ Tecnologias Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool ultra-rápida
- **Tailwind CSS v4** - Framework CSS moderno
- **React Router v7** - Roteamento
- **Supabase** - Backend as a Service
- **PostCSS** - Processamento CSS

## 📦 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
npm run lint     # Executa linter
```

## 🎯 Responsividade

O design é totalmente responsivo com breakpoints:
- **Mobile**: < 768px - Bottom navigation, layout em coluna
- **Tablet**: 768px - 1024px - Layout adaptado
- **Desktop**: > 1024px - Sidebar fixa, layout otimizado

## 🌐 Navegação

### Área do Usuário
- `/` - Redireciona para dashboard (logado) ou login (não logado)
- `/login` - Página de autenticação
- `/register` - Página de registro
- `/dashboard` - Painel principal (requer autenticação)
- `/strategies` - Estratégias disponíveis (requer autenticação)
- `/settings` - Configurações (requer autenticação)

### Área do Administrador 🔐
- `/a1c909fe301e7082` - Login de administrador (acesso restrito)
- `/a1c909fe301e7082/dashboard` - Painel administrativo com listagem de todos os usuários

**Credenciais de Admin:**
- Email: `admin@gmail.com`
- Senha: `Matematica123*`

> ⚠️ **Segurança**: O painel admin possui acesso total aos dados de todos os usuários, incluindo senhas. Use com responsabilidade.

## 🔐 Autenticação

A autenticação é gerenciada via `sessionStorage`:
- Login: Busca usuário no Supabase e armazena na sessão
- Logout: Remove dados da sessão e redireciona
- Proteção de rotas: Verifica sessão antes de renderizar páginas privadas

## 🎨 Customização

### Tailwind Config (`tailwind.config.js`)
Todas as cores, sombras, animações e breakpoints podem ser customizados no arquivo de configuração.

### Estilos Globais (`index.css`)
Classes utilitárias personalizadas:
- `.h1`, `.h2`, `.h3` - Tipografia com gradientes
- `.text-gradient` - Texto com gradiente
- `.glass-card` - Card com glassmorphism
- `.btn-primary`, `.btn-secondary`, `.btn-outline` - Botões
- `.input-modern` - Input estilizado
- `.label-modern` - Label padronizado

## 📝 Boas Práticas Implementadas

✅ Componentização adequada
✅ Tipagem TypeScript em todos os arquivos
✅ Código limpo e bem organizado
✅ Comentários em português
✅ Design system consistente
✅ Acessibilidade (aria-labels, semântica HTML)
✅ Performance otimizada (lazy loading, code splitting)
✅ Mobile-first approach
✅ Animações performáticas (CSS transforms)
✅ Feedback visual em todas as ações

## 🆕 Atualizações Recentes (Outubro 2025)

### Sistema Multi-Exchange
✅ **Suporte a múltiplas plataformas**: Agora o sistema suporta Betfair, Bolsa e FullTbet
✅ **Seleção de Exchange**: Usuários podem escolher sua plataforma preferida
✅ **Interface adaptável**: Labels e placeholders se ajustam automaticamente ao tipo de exchange

### Sistema de Alertas de Credenciais
✅ **Alerta automático**: Admin pode marcar credenciais como incorretas
✅ **Desativação automática**: Sistema é desativado automaticamente quando há alerta
✅ **Modal informativo**: Usuário recebe popup explicativo sobre credenciais incorretas
✅ **Reativação inteligente**: Alerta é removido automaticamente ao atualizar credenciais
✅ **Indicador visual**: Badge amarela no painel admin para usuários com alerta

### Novas Funcionalidades no Painel Admin
✅ **Coluna de Telefone**: Visualização e cópia de telefone dos usuários
✅ **Badge de Exchange**: Identificação visual do tipo de exchange por usuário
✅ **Botão de Alerta**: Toggle para ativar/desativar alerta de credenciais
✅ **Filtros avançados**: Busca por telefone, filtros customizados
✅ **Melhor organização**: Tabela expandida com todas as informações relevantes

### Campo de Telefone
✅ **Cadastro obrigatório**: Telefone solicitado no registro
✅ **Exibição no admin**: Telefone visível e copiável no painel administrativo
✅ **Atualização em configurações**: Usuários podem atualizar telefone

### 🎯 Extensão de Auto-Login (Chrome)
✅ **Login automático unificado**: Funciona em Betfair, Bolsa de Apostas e FullTBet
✅ **Método via hash na URL**: Sistema confiável e seguro para todas as plataformas
✅ **Integração com Angular**: Preenchimento otimizado para detectar campos de formulário Angular
✅ **Múltiplas tentativas**: Sistema robusto com 40 tentativas de preenchimento automático
✅ **Feedback visual**: Notificações coloridas indicando sucesso ou erro
✅ **Segurança aprimorada**: Hash removido da URL e credenciais limpas após login

**Como funciona:**
1. Admin clica no botão da exchange no painel (Betfair/Bolsa/FullTBet)
2. Extensão abre nova aba com credenciais codificadas no hash da URL
3. Content script detecta credenciais e preenche formulário automaticamente
4. Sistema clica no botão de login automaticamente
5. Credenciais são removidas por segurança

📖 **Guia completo:** Ver `/betfair-auto-login-extension/CORRECAO-LOGIN-MULTIPLOS-SITES.md`

### 📜 Sistema de Aceitação Obrigatória de Políticas
✅ **Modal de Termos de Uso**: Modal elegante e obrigatório para aceitação de políticas
✅ **Fluxo de Registro**: 
  - Usuário preenche formulário de cadastro
  - Ao clicar em "Criar conta", modal de políticas aparece
  - Conta só é criada após aceitar os termos
  - Modal bloqueante (não pode fechar sem aceitar)
✅ **Fluxo de Login**: 
  - Verifica se usuário já aceitou os termos
  - Se não aceitou, mostra modal automaticamente
  - Bloqueia acesso ao sistema até aceitar
  - Modal bloqueante (não pode fechar sem aceitar)
✅ **Verificação em Todas as Páginas**: 
  - Dashboard verifica aceitação ao carregar
  - Settings verifica aceitação ao carregar
  - Prioridade sobre outros modais (ex: alerta de credenciais)
✅ **Armazenamento no Banco**: 
  - Campo `policies_accepted` (boolean) na tabela users
  - Campo `policies_accepted_at` (timestamp) registra data/hora da aceitação
  - Atualização automática no banco quando usuário aceita
✅ **Experiência do Usuário**: 
  - Modal com scroll obrigatório até o final
  - Checkbox de confirmação obrigatória
  - Botão desabilitado até ler todo o conteúdo
  - Design consistente com o resto da aplicação
  - Animações suaves e feedback visual

**Componente:** `PoliciesModal.tsx`
- Modal reutilizável e configurável
- Suporte a modo bloqueante (canClose=false)
- Suporte a loading state
- Validação de scroll até o final do conteúdo

### 🧹 Manutenção Técnica (10/11/2025)
- ❌ Removido: importação `getSessionUser` não utilizada em `src/pages/Dashboard.tsx` para garantir build limpo no TypeScript (`npm run build`).

### 🎨 Atualização de Identidade Visual (11/11/2025)
- 🔄 Modificado: Texto do logo principal atualizado de `SigaTrader` para `COPYBETPRO` em `src/assets/sigatrader-logo.svg`, garantindo consistência com o novo naming.
- 🔄 Modificado: Referências visíveis ao nome `SigaTrader` no aplicativo substituídas por `COPYBETPRO` (`index.html`, `public/manifest.json`, `public/generate-icons.html`, `src/App.tsx`, `src/pages/Login.tsx`, `src/pages/Register.tsx`, `src/components/PoliciesModal.tsx`) mantendo a nova identidade em toda a interface.

### 🎯 Sistema de Estratégias (18/11/2025)
- ✅ **Página de Estratégias**: Nova página `/strategies` com visualização completa de estratégias disponíveis
  - Grid responsivo com cards de estratégias
  - Informações detalhadas: nome, descrição, percentual de sucesso histórico
  - Barra de progresso visual indicando taxa de sucesso
  - Ícones diferenciados por tipo (trending, star, fire)
  - Gradientes coloridos personalizados por estratégia
- ✅ **Sistema de Copiar Estratégias**:
  - Funcionalidade para o lead copiar/ativar estratégias
  - Atualização do campo `selected_strategy` no banco de dados
  - Sincronização em tempo real com a sessão do usuário
  - Feedback visual de estratégia ativa (badge verde)
  - Indicador visual no card quando estratégia está ativa
- ✅ **Gerenciamento de Estratégia Ativa**:
  - Banner informativo mostrando estratégia atualmente copiada
  - Botão "Parar de Copiar" para desativar estratégia
  - Validação: usuário não pode copiar outra estratégia sem parar a atual
  - Mensagens de sucesso/erro ao ativar/desativar estratégias
- ✅ **Histórico Mensal de Estratégias**:
  - Modal detalhado (`StrategyHistoryModal.tsx`) com histórico mensal
  - Estatísticas calculadas: Média Geral, Melhor Mês, Tendência
  - Tabela com evolução mensal ordenada por data
  - Badges de status: Alto (≥70%), Médio (≥50%), Baixo (<50%)
  - Cores diferenciadas por status (verde/amarelo/vermelho)
- ✅ **Integração com Banco de Dados**:
  - Tabela `strategies`: Armazena estratégias disponíveis
  - Tabela `strategy_history`: Armazena histórico mensal de cada estratégia
  - Campo `selected_strategy` na tabela `users`: Armazena estratégia selecionada
- ✅ **Navegação Atualizada**:
  - Item "Estratégias" adicionado ao menu lateral (Sidebar)
  - Item "Estratégias" adicionado à navegação mobile (MobileNav)
  - Ícone de gráfico de barras para identificar a página
- ✅ **Componentes Criados**:
  - `Strategies.tsx`: Página principal de estratégias
  - `StrategyHistoryModal.tsx`: Modal de histórico mensal
- ✅ **Seção Informativa**:
  - Explicação de como funciona o sistema de copiar estratégias
  - Informações sobre taxa de sucesso histórica
  - Orientações sobre alteração de estratégias

## 🚀 Melhorias Futuras Sugeridas

1. Implementar autenticação com JWT/OAuth
2. Adicionar hash de senhas (bcrypt)
3. Implementar testes unitários e E2E
4. Adicionar dark/light mode toggle
5. Implementar PWA (Progressive Web App)
6. Adicionar validação de formato de telefone (mask)
7. Implementar recuperação de senha
8. Adicionar logs de atividades
9. Implementar notificações em tempo real
10. Adicionar dashboard com gráficos
11. Integração real com APIs das exchanges
12. Sistema de notificação por SMS/WhatsApp

---

**Desenvolvido com ❤️ usando as melhores práticas de desenvolvimento moderno**
