# CLAUDE.md — Plataforma de Gerenciamento de Sensores de Solo

## Visão Geral do Projeto

Este é um TCC (Trabalho de Conclusão de Curso) de Ciência da Computação. Trata-se de uma **plataforma de gerenciamento de dados de sensores de solo** voltada para pequenos e médios agricultores — pessoas que muitas vezes não possuem conhecimento técnico ou têm resistência a novas tecnologias por trabalharem com métodos tradicionais, às vezes passados de geração em geração.

O objetivo é **introduzir esses agricultores a sensores baratos e simples**, combinados com uma plataforma direta e visualmente atrativa, sem exigir nenhum conhecimento técnico.

O projeto possui **três frentes**:

| Frente                        | Responsável              | Escopo                               |
| ----------------------------- | ------------------------ | ------------------------------------ |
| **Front-end (dashboard web)** | Breno (este repositório) | Dashboard React + Vite               |
| **Back-end**                  | Equipe                   | API + integração LoRa na AWS         |
| **Hardware/Firmware**         | Equipe                   | Sensor físico + app mobile Bluetooth |

---

## Escopo deste Repositório

Este repositório contém **exclusivamente o front-end do dashboard web**. Não contém código do back-end, firmware ou do aplicativo mobile de configuração.

---

## Contexto de Negócio

- **Público-alvo**: pequenos e médios agricultores com baixa familiaridade tecnológica
- **Modelo de uso**: agricultores acessam o dashboard via browser para monitorar seus sensores de campo
- **Configuração de sensores**: feita via aplicativo mobile separado (Bluetooth BLE) — fora do escopo deste repositório
- **Escala atual**: poucos clientes no início, mas a arquitetura deve suportar **muitos sensores por cliente**
- **Frequência de dados**: sensores enviam leituras a cada **~15 minutos** via LoRa → AWS → API REST
- **Não há streaming**: não é necessário WebSocket, SSE ou polling agressivo

---

## Variáveis Monitoradas pelos Sensores

Cada sensor coleta os seguintes parâmetros:

1. `soil_temperature` — Temperatura do solo (°C)
2. `soil_moisture` — Umidade do solo (%)
3. `air_humidity` — Umidade do ar (%)
4. `luminosity` — Luminosidade (lux)
5. `air_temperature` — Temperatura do ar (°C)
6. `battery` — Nível de bateria (%)

---

## Stack Tecnológica

### Core

| Tecnologia       | Versão | Papel                              |
| ---------------- | ------ | ---------------------------------- |
| **React**        | 18+    | UI framework                       |
| **Vite**         | latest | Build tool e dev server            |
| **TypeScript**   | 5+     | Tipagem estática em todo o projeto |
| **Tailwind CSS** | v4     | Utility-first styling              |

### Componentes & UI

| Tecnologia                          | Papel                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| **shadcn/ui**                       | Componentes base (Sidebar, Cards, Table, Select, Tabs, etc.) |
| **Recharts** (via shadcn/ui charts) | Gráficos de séries temporais dos sensores                    |

### Dados & Estado

| Tecnologia            | Papel                                                     |
| --------------------- | --------------------------------------------------------- |
| **TanStack Query v5** | Data fetching, cache e sincronização com o servidor       |
| **React Router v6**   | Roteamento entre páginas do dashboard                     |
| **Zustand**           | Estado global leve (se necessário além do TanStack Query) |

### Mapas

| Tecnologia                    | Papel                                      |
| ----------------------------- | ------------------------------------------ |
| **MapLibre GL JS**            | Engine de renderização de mapa (WebGL/GPU) |
| **react-map-gl/maplibre**     | Wrapper React para MapLibre                |
| **Stadia Maps** (ou MapTiler) | Tiles de mapa (tier gratuito)              |

### Autenticação

| Tecnologia             | Papel                                    |
| ---------------------- | ---------------------------------------- |
| **Auth0**              | Autenticação e gerenciamento de usuários |
| **@auth0/auth0-react** | SDK SPA (Authorization Code + PKCE)      |

### Deploy

| Serviço                   | Papel                                                        |
| ------------------------- | ------------------------------------------------------------ |
| **Azure Static Web Apps** | Hospedagem do front-end (build estático)                     |
| **AWS**                   | Back-end, banco de dados e integração LoRa (fora deste repo) |

> **Nota de deploy**: o build gera uma pasta `dist/` estática. Não há Node.js em runtime. O Azure Static Web Apps serve os arquivos via CDN global.

---

## Arquitetura de Dados (Front-end)

### Estratégia de Cache com TanStack Query

Dados chegam a cada ~15 minutos, portanto o cache deve ser agressivo para evitar requests desnecessários.

```
staleTime por tipo de dado:
  - Leituras mais recentes (mapa/tooltips): 5 minutos
  - Séries temporais (gráficos):           14 minutos
  - Histórico longo (7d/30d):              30 minutos
  - Metadados do sensor (nome, localização): 1 hora
```

### Query Key Factory (padrão obrigatório)

```typescript
export const sensorKeys = {
  all: ["sensors"] as const,
  list: () => [...sensorKeys.all, "list"] as const,
  detail: (id: string) => [...sensorKeys.all, "detail", id] as const,
  readings: (id: string, param: string, range: string) =>
    [...sensorKeys.detail(id), "readings", param, range] as const,
  latest: (id: string) => [...sensorKeys.detail(id), "latest"] as const,
};
```

### Downsampling de dados históricos

Para períodos longos, o back-end deve retornar dados agregados:

- Últimas 24h → resolução completa (~96 pontos por sensor)
- Últimos 7 dias → médias horárias (~168 pontos)
- Últimos 30 dias → médias diárias (~30 pontos)

---

## Páginas e Rotas

```
/                        → Landing page (pública)
/login                   → Redirect para Auth0
/callback                → Auth0 callback (tratado pelo SDK)

/dashboard               → Redireciona para /dashboard/map
/dashboard/map           → Mapa interativo com todos os sensores
/dashboard/soil-temp     → Página: Temperatura do Solo
/dashboard/soil-moisture → Página: Umidade do Solo
/dashboard/air-humidity  → Página: Umidade do Ar
/dashboard/luminosity    → Página: Luminosidade
/dashboard/air-temp      → Página: Temperatura do Ar
/dashboard/battery       → Página: Bateria
/dashboard/settings      → Configurações do usuário
```

Todas as rotas `/dashboard/*` são **protegidas** — requerem autenticação Auth0.

---

## Funcionalidades do Dashboard

### 1. Landing Page (`/`)

- Apresentação da plataforma
- Informações sobre os sensores disponíveis
- Planos e preços
- CTA para login/cadastro
- **Totalmente pública**, sem autenticação

### 2. Mapa Interativo (`/dashboard/map`)

- Exibe **todos os sensores do usuário autenticado** como marcadores no mapa
- Tooltip ao hover/click em cada marcador mostrando:
  - Nome do sensor
  - Última leitura de cada parâmetro
  - Timestamp da última leitura
- Ícones de atenção nos marcadores:
  - 🔋 Bateria baixa (< 20%)
  - 🌡️ Temperatura alta (acima de threshold configurado)
  - 💧 Umidade baixa (abaixo de threshold configurado)
- Clustering automático para muitos sensores (via MapLibre GeoJSON clustering)
- **Performance**: usar layers nativas do MapLibre (GeoJSON source), nunca criar um componente React por marcador

### 3. Páginas por Parâmetro (`/dashboard/:param`)

- Layout padrão para todas as páginas de parâmetro
- Componentes:
  - **Header** com nome do parâmetro, unidade e ícone
  - **Cards de KPI** (valor atual, mín., máx., média do período)
  - **Gráfico de séries temporais** (Recharts `<AreaChart>` ou `<LineChart>`)
  - **Seletor de período** (24h, 7d, 30d)
  - **Seletor de sensor** (dropdown se o usuário tiver múltiplos sensores)
  - **Indicador de alerta** se o valor estiver fora do range normal

### 4. Sidebar de Navegação

- Navegação entre todas as páginas do dashboard
- Indicador visual de alertas ativos por parâmetro
- Identificação do usuário (nome + avatar)
- Link para `/dashboard/settings`
- Colapsável (ícone + texto ↔ apenas ícone)

### 5. Configurações do Usuário (`/dashboard/settings`)

- Edição de dados pessoais (nome, e-mail)
- Alteração de senha (delegado ao Auth0)
- Configuração de thresholds de alerta por parâmetro
- Gerenciamento de sensores (listar, renomear, remover)

---

## Alertas e Indicadores de Atenção

Thresholds padrão (configuráveis pelo usuário):

| Parâmetro           | Alerta baixo | Alerta alto  |
| ------------------- | ------------ | ------------ |
| Bateria             | < 20%        | —            |
| Umidade do solo     | < 30%        | > 90%        |
| Temperatura do solo | —            | > 35°C       |
| Umidade do ar       | < 20%        | > 95%        |
| Temperatura do ar   | < 0°C        | > 40°C       |
| Luminosidade        | —            | (contextual) |

---

## Convenções de Código

### Estrutura de Pastas

```
src/
├── components/
│   ├── ui/               # Componentes shadcn/ui (gerados, não editar diretamente)
│   ├── map/              # Componentes do mapa (MapView, SensorMarker, SensorPopup)
│   ├── charts/           # Componentes de gráficos (SensorChart, ChartContainer)
│   ├── sensors/          # Componentes de sensores (SensorCard, AlertBadge)
│   ├── layout/           # Layout global (Sidebar, Header, PageWrapper)
│   └── landing/          # Componentes da landing page
├── pages/
│   ├── landing/
│   └── dashboard/
├── hooks/                # Custom hooks (useSensors, useSensorReadings, useAlerts)
├── services/             # Funções de fetch para a API (sensorService, authService)
├── lib/
│   ├── queryKeys.ts      # Query key factory centralizado
│   ├── queryClient.ts    # Configuração do QueryClient
│   └── utils.ts          # Utilitários (shadcn/ui cn(), formatters)
├── types/                # Tipos TypeScript globais (Sensor, Reading, Alert, User)
└── constants/            # Thresholds padrão, labels de parâmetros, cores
```

### Tipagem

- **Sempre** tipar props de componentes com `interface` (não `type` para props)
- **Nunca** usar `any` — usar `unknown` e narrowing quando necessário
- Tipos de domínio ficam em `src/types/`

### Componentes

- Componentes funcionais com arrow functions: `const MyComponent = () => {}`
- Um componente por arquivo
- Nomes de arquivos em PascalCase para componentes, camelCase para hooks e utilitários
- Exportar como named export, não default (exceto páginas)

### Estilo

- Usar **exclusivamente** Tailwind CSS — sem CSS modules, sem styled-components
- Classes condicionais com o utilitário `cn()` do shadcn/ui
- Paleta de cores definida em `tailwind.config.ts` (verde agrícola como cor primária)
- Responsividade mobile-first

---

## API Contract (esperado do back-end)

O front-end consome uma API REST. Endpoints esperados:

```
GET /sensors                          → Lista sensores do usuário autenticado
GET /sensors/:id                      → Detalhes de um sensor
GET /sensors/:id/readings/latest      → Última leitura de todos os parâmetros
GET /sensors/:id/readings/:param      → Série temporal de um parâmetro
  ?from=ISO_DATE&to=ISO_DATE
  ?resolution=raw|hourly|daily
PATCH /sensors/:id                    → Atualizar nome/thresholds do sensor
DELETE /sensors/:id                   → Remover sensor da conta

GET /user/profile                     → Perfil do usuário autenticado
PATCH /user/profile                   → Atualizar dados do perfil
```

Autenticação: **Bearer Token JWT** do Auth0 no header `Authorization`.

---

## Variáveis de Ambiente

```env
VITE_AUTH0_DOMAIN=           # Ex: dev-xxxx.us.auth0.com
VITE_AUTH0_CLIENT_ID=        # Client ID do Auth0 (SPA)
VITE_AUTH0_AUDIENCE=         # Audience da API (para JWT)
VITE_API_BASE_URL=           # URL base da API do back-end
VITE_MAP_TILE_URL=           # URL dos tiles de mapa (Stadia/MapTiler)
VITE_MAP_TILE_API_KEY=       # API key do provedor de tiles
```

---

## Decisões de Arquitetura Documentadas

| Decisão                 | Escolha                     | Motivo                                                                                   |
| ----------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| Next.js vs Vite         | **Vite**                    | Dashboard privado (sem SEO), deploy estático no Azure, sem necessidade de SSR            |
| SWR vs TanStack Query   | **TanStack Query v5**       | `staleTime` configurável, query keys estruturadas, DevTools, polling adaptativo          |
| Leaflet vs MapLibre     | **MapLibre**                | Renderização WebGL/GPU, clustering nativo, 100% gratuito, escala para 1000+ marcadores   |
| MUI/Ant vs shadcn/ui    | **shadcn/ui**               | Tailwind-nativo, zero lock-in, bundle mínimo, ownership total do código                  |
| Chart.js vs Recharts    | **Recharts**                | API JSX declarativa, integração nativa com shadcn/ui charts, adequada ao volume de dados |
| Redux vs Zustand        | **Zustand** (se necessário) | TanStack Query gerencia estado de servidor; Zustand apenas para estado UI local global   |
| CSS Modules vs Tailwind | **Tailwind**                | Consistência com shadcn/ui, sem context switching, purge automático                      |

---

## O que NÃO está no escopo deste repositório

- ❌ Código do back-end (AWS Lambda, API Gateway, banco de dados)
- ❌ Integração LoRa / AWS IoT Core
- ❌ Aplicativo mobile de configuração Bluetooth (Flutter)
- ❌ Firmware do sensor
- ❌ Painel administrativo para a equipe da plataforma
- ❌ Autenticação de múltiplos tenants (multi-tenant é responsabilidade do back-end)
