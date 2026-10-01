# CLAUDE.md — SmartFarm, dashboard web

## Visão geral

TCC de Ciência da Computação: uma **plataforma de gerenciamento de dados de sensores de solo** para
pequenos e médios agricultores — gente que muitas vezes não tem familiaridade técnica, ou resistência
a tecnologia por trabalhar com métodos passados de geração em geração.

O objetivo é **introduzir esses produtores a sensores baratos e simples**, com um painel direto e
visualmente atrativo que não exija conhecimento nenhum para ser usado.

| Frente | Responsável | Escopo |
| --- | --- | --- |
| Front-end (este repositório) | Breno | Dashboard React + Vite |
| Back-end | Equipe | 7 microsserviços em Go, na Azure |
| Hardware / firmware | Equipe | Sensor LoRa + app mobile de configuração |

Este repositório é **só o front**. O back-end vive em `../tcc-backend` (repositórios separados por
serviço) e a infraestrutura está documentada em `../tcc-backend/docs/infraestrutura-nuvem.md`.

---

## Como trabalhar comigo

Esta seção é sobre estilo de resposta, e é tão importante quanto o resto do arquivo.

**Explique o mecanismo antes da solução.** Quando algo quebra, mostre o caminho que o dado percorre e
onde exatamente ele se perde, não só o arquivo a corrigir. Um diagrama do fluxo ou uma tabela
comparando "o que A envia" contra "o que B espera" vale mais do que a linha do patch.

**Não presuma que eu já sei.** Se aparecer um conceito de infra, protocolo ou biblioteca — proxy
reverso, terminação TLS, escala a zero, refresh token, cardinalidade de consumo —, explique o que é
e por que ele existe naquele lugar. Prefira uma analogia concreta a uma definição formal.

**Justifique as escolhas, com o que se perde junto.** Toda decisão tem contrapartida. Diga por que
escolheu um caminho, o que descartou e o custo do que ficou. Se houver mais de uma opção defensável,
apresente com números ou consequências, e recomende uma — mas deixe claro que é recomendação.

**Verifique em vez de afirmar.** Este projeto já custou horas por suposições que pareciam óbvias:
que a claim do JWT era `fazenda1`, que a ACL do broker estava liberada, que o compose no ar era o do
working tree. Leia o que está realmente rodando: `git show origin/main:arquivo`,
`docker inspect`, consulta direta ao banco. Quando não der para verificar, **diga que é suposição.**

**Corrija meus enganos explicitamente.** Se eu resumir algo errado, aponte o que não confere e por
quê, sem rodeio e sem constrangimento. Um "quase isso, mas..." seguido da distinção correta é mais
útil do que concordar.

**Assuma os próprios erros do mesmo jeito.** Se você errou o diagnóstico, quebrou algo ou fez uma
verificação enviesada, diga o que aconteceu e o que mudaria daqui pra frente. Sem se flagelar, mas
sem deixar passar.

**Diga sempre o que ficou pendente**, o que não foi verificado e o que depende de algo que você não
tem acesso. Nada de dar por concluído o que só foi commitado e não deployado.

**Sobre o tom:** português do Brasil, direto mas não seco. Tabelas e blocos de código quando ajudarem
a comparar ou a copiar. Evite listar tudo que poderia ser feito — foque no que interessa à decisão
que está na mesa.

---

## Contexto de negócio

- **Público**: pequenos e médios agricultores, baixa familiaridade tecnológica
- **Uso**: acessam o painel pelo navegador para acompanhar os sensores do campo
- **Provisionamento do sensor**: por app mobile separado (Bluetooth BLE), fora deste repositório
- **Escala**: poucos clientes no início; muitos sensores por cliente
- **Frequência**: leituras a cada ~15 minutos, via LoRa → network server → API
- **Sem streaming**: nada de WebSocket, SSE ou polling agressivo

---

## Identidade do usuário — leia antes de mexer em auth

**A identidade é o `sub` do Auth0** (`auth0|69cb0b64c7c55babb4694086`). Não é a claim customizada
`https://smartfarm-api/userId`, que vale `fazenda1` e não corresponde a série nenhuma no InfluxDB.

**O que mudou em 09/09/2026:** o commit `eb183d8` ("fix: functional version") do `api-service`
**apagou `auth.go` e `supabase.go`**. Não existe mais validação de JWT nem cadastro no Supabase, e o
`userId` voltou a viajar **na URL** de todas as rotas. O front continua mandando o
`Authorization: Bearer`, mas o servidor ignora.

Consequências práticas, e uma delas incomoda:

- O `sub` vai na URL, codificado (`auth0%7C69cb...`). Quem fornece é
  `src/features/auth/lib/use-user-id.ts`, e ele é só `user?.sub` — sem claim, sem fallback
- **Qualquer usuário logado lê o histórico de qualquer devEUI que souber.** A query de repopulação
  da `/api/sensors/latest/:userId/:devEUI` filtra só por `devEUI`; o userId da URL serve apenas para
  montar a chave do Redis. É consequência direta de o authMiddleware ter saído
- Já a `/api/sensors/influx/:userId/:days/:devEUI` **filtra** por userId. Daí a assimetria atual: o
  `2026-tcc-cmd03` aparece na lista com a leitura dele, mas de gráfico vazio — as 30 leituras estão
  gravadas sob `ausdgsaduUSERIDajbd`, um identificador que o `mqtt-sub` leu da tabela `users` do
  Supabase. Some quando o devEUI for associado ao `sub` lá
- Perfil (nome, e-mail) vive na **Management API do Auth0** — ver
  `src/entities/user/api/fetch-user-profile.ts`

O Auth0 usa `useRefreshTokens` com `useRefreshTokensFallback={false}`. Sem os refresh tokens a
renovação silenciosa depende de iframe com cookies de terceiros, que o Firefox bloqueia por padrão —
o que gerava um loop de redirecionamento entre a landing e o painel.

> **`Missing Refresh Token`**: com o fallback desligado o SDK não tem plano B e estoura seco. Exige
> **Allow Offline Access** ligado na API dentro do Auth0 **e um login novo** — o refresh token só é
> emitido no login, então ligar a opção sem relogar não muda nada. O `useSensorsList` protege o
> painel desse erro com um `catch` que devolve lista vazia: ele abre no estado vazio em vez de cair
> na tela de erro. Antes esse amortecedor vinha de graça dos sensores de demonstração, que eram
> montados antes de pedir o token; com eles removidos, quem segura é o `catch`.

---

## A armadilha dos dois nomes

**O identificador do dispositivo tem dois nomes convivendo no sistema, e isso já quebrou o produto em
quatro camadas diferentes.**

| Fluxo | Nome do campo | Routing key no RabbitMQ | Tag no InfluxDB |
| --- | --- | --- | --- |
| Broker próprio (simulador, hoje em produção) | `deviceId` | `sensor.*` | `deviceId` |
| Network server LoRa (desenho alvo) | `devEUI` / `devAddr` | `device.*` | `devEUI` |

Os quatro pontos onde isso quebrou, todos no mesmo dia:

1. Binding da fila do `cache-service` no RabbitMQ
2. Chave gravada no Redis
3. Corpo do envelope lido pelo adapter do front (`src/entities/sensor/api/adapters.ts`)
4. Tag do InfluxDB — o connector grava `deviceId`, a API consultava `devAddr`

Os três primeiros foram resolvidos com shims que **aceitam os dois nomes**, e continuam de pé: o
`cache-service` em produção faz bind nas duas routing keys (`device.#` e `sensor.#`) e o adapter do
front lê `devEUI || deviceId`. **O quarto voltou a quebrar** em 09/09/2026: a `main` do `api-service`
perdeu o shim e passou a filtrar só por `devEUI`, enquanto o connector segue gravando `deviceId`. É
por isso que não há gráfico. Ao mexer em qualquer serviço da cadeia, confira os quatro — não basta
ler o código de um.

E são conceitos distintos, não sinônimos: o **`devEUI`** é a identidade de fábrica do aparelho e
nunca muda; o **`devAddr`** é o endereço que o network server atribui e pode mudar a cada reingresso.
Nos sensores simulados os dois são iguais porque não há rede LoRa envolvida.

---

## Parâmetros monitorados

1. `soil_moisture` — umidade do solo (%)
2. `air_humidity` — umidade do ar (%)
3. `luminosity` — luminosidade (lux)
4. `air_temperature` — temperatura do ar (°C)
5. `battery` — bateria (%)

> **Eram seis.** A `soil_temperature` foi **removida do painel em 25/09/2026** — página, rota, item
> da sidebar, limites, pin do mapa e tipos. O payload LoRa de 15 bytes não carrega esse campo e não
> vai carregar, então a página existia para nunca ter dado. Está no histórico do git se voltar.

> O payload binário do sensor LoRa tem 15 bytes e carrega exatamente estas **cinco** medidas, mais o
> boolean `validity`. **Não tem latitude/longitude**, então o dispositivo real entra no painel **sem
> pin no mapa** — e é por isso que a lista acima tem cinco itens e não seis.

### Sensores do simulador

`1e23a01` (saudável), `1e23a02` (bateria 18%, pin amarelo) e `1e23a03` (umidade do solo 14%, pin
vermelho) vêm do `sensor-simulator`, que roda na VM e publica a cada 15 minutos no broker MQTT
próprio. **Eles chegam pela API**, com dado que atravessou RabbitMQ, Redis e InfluxDB — não são
gerados no navegador.

> **Existiu um `src/entities/sensor/lib/mock-sensors.ts`** que gerava esses mesmos três ids no
> cliente, com PRNG semeado, enquanto o `sensor-simulator` estava órfão (publicava e ninguém lia).
> Foi **removido em 17/09/2026**, quando a VM voltou com o `mqtt-sub` que escuta aquele broker: os
> ids passaram a chegar por dois caminhos e o painel exibia sete cards e seis pins sobrepostos. Se
> algum dia for preciso um painel sem back-end, ele está no histórico do git.

São os **únicos com coordenada** — o payload LoRa não traz lat/long —, então são o que o mapa
consegue plotar.

### Limites de alerta (editáveis pelo usuário)

Em `src/shared/constants/thresholds.ts`. A função `evaluateParam` devolve status **e** o lado que
estourou (`low`/`high`); `statusForParam` deriva dela, para os dois nunca divergirem.

| Parâmetro | Alerta baixo | Atenção baixo | Atenção alto | Alerta alto |
| --- | --- | --- | --- | --- |
| Bateria | 15% | 20% | — | — |
| Umidade do solo | 20% | 30% | 80% | 90% |
| Umidade do ar | 15% | 20% | 90% | 95% |
| Temp. do ar | 0°C | 5°C | 35°C | 40°C |
| Luminosidade | — | — | — | — |

---

## Stack

| Camada | Escolha |
| --- | --- |
| Core | React 18, Vite, TypeScript 5, Tailwind **v4** |
| Componentes | shadcn/ui |
| Gráficos | Recharts |
| Dados | TanStack Query v5, Zustand |
| Rotas | React Router v7 |
| **Mapa** | **Leaflet** |
| Ícones | lucide-react, e `react-icons/md` só para o `MdOutlineSensors` do pin |
| Auth | Auth0 (`@auth0/auth0-react`), Authorization Code + PKCE |
| Deploy | Azure Static Web Apps |

> **`maplibre-gl` e `react-map-gl` estão no `package.json` mas não são importados em lugar nenhum.**
> São resquício de uma decisão revertida. O mapa é Leaflet. Podem ser removidos.

> **Tailwind v4:** as utilitárias `scale-*` escrevem na propriedade CSS `scale`, não em `transform`.
> Transicionar `transform` não alcança a escala — usar `transition-[opacity,scale]`.

---

## Estrutura de pastas — Feature-Sliced Design

```
src/
├── app/          # providers, router, estilos globais
├── entities/     # domínio: sensor, reading, user (api/ model/ lib/)
├── features/     # ações do usuário: auth, sensor-search, thresholds-edit, ...
├── widgets/      # blocos compostos: sidebar
├── pages/        # uma pasta por rota, sempre com subpasta ui/
└── shared/       # ui/, lib/, api/, stores/, constants/, config/
```

Não existem `src/components`, `src/hooks`, `src/services`, `src/types` nem `src/constants` — se
alguma documentação antiga mencionar, está desatualizada.

---

## Rotas

```
/                        Landing pública
/callback                Retorno do Auth0 (página real, ver abaixo)
/dashboard               → redireciona para /dashboard/map
/dashboard/map           Mapa com os pins dos sensores
/dashboard/<parametro>   soil-moisture, air-humidity, luminosity, air-temp, battery
/dashboard/sensor/:id    Detalhe de um sensor
/dashboard/settings      Configurações
```

Tudo sob `/dashboard/*` passa pelo `ProtectedRoute`. A `/callback` é **pública de propósito** — o
usuário ainda não está autenticado quando chega lá, e o guard o mandaria de volta ao login.

### Continuidade visual do carregamento

A `/callback` e o overlay do dashboard usam o **mesmo `LoadingIndicator`, na mesma posição**, para a
troca de rota passar despercebida. Só a mensagem avança: "Verificando sua conta" → "Preparando seu
painel" → "Carregando sensores". Ao mexer em qualquer um dos dois, preserve a posição do anel — a
caixa da mensagem tem altura fixa justamente para um texto mais longo não empurrar o anel para cima.

---

## O que a API entrega

Base URL em `VITE_API_BASE_URL`. **Três rotas, todas com o userId no path:**

```
GET /api/sensors/all/:userId                   última leitura de cada sensor do usuário
GET /api/sensors/latest/:userId/:devEUI        até 20 leituras recentes (Redis, com recarga do Influx)
GET /api/sensors/influx/:userId/:days/:devEUI  série temporal para os gráficos
```

Não existe mais `/health` nem `/api/sensors/devices`. Só há **leitura**: renomear sensor e limites de
alerta são guardados **no navegador**, via `src/shared/lib/preferences-storage.ts`.

**O histórico é indexado por `devEUI`, não por `devAddr`.** Consultar pelo devAddr (`d99eefe3`)
devolve lista vazia — é outra tag da mesma série.

**Como o front monta a lista** (`collect-sensor-messages.ts`): a `/all` serve só para **descobrir**
quais devEUIs existem, e a leitura de cada um vem da `/latest`. Custa uma requisição a mais e paga
por duas coisas — o dado certo, e o cache esquentado.

| Armadilha | Por quê |
| --- | --- |
| `/all` devolve **404** com cache frio | nenhuma leitura para aquele userId. É estado normal, não erro |
| `/all` devolve **500** com cache frio tendo dados | o `group()` antes do `pivot` junta o boolean `validity` com os floats e o Influx recusa: `schema collision` |
| O índice 0 da `/latest` **não é o mais recente** | o `sort` do Flux é por tabela, e o `reverseArray` do back inverte a concatenação delas. Escolha sempre por `payload.timestamp` |
| `/influx` devolve **`null`**, não `[]` | `var slice []T` sem append serializa assim em Go |
| `/influx` devolve **`null` para TODOS os sensores hoje** | ver abaixo — é a armadilha dos dois nomes, na camada do InfluxDB |

> **Nenhum gráfico tem linha no momento**, e a causa não está no front. O `influx-connector` que
> roda na VM é de 10/jun e grava a série com a tag **`deviceId`**; a query da `main` filtra por
> **`devEUI`**. Nenhum ponto casa, em período nenhum. Vale para os três do simulador; para o
> `2026-tcc-cmd03` some por outro motivo — os pontos dele existem com a tag `devEUI` certa, mas sob
> outro `userId`.
>
> Três saídas, nenhuma no front: (1) uma linha no `influx-connector` gravando também a tag `devEUI`,
> que conserta daí em diante; (2) regravar as séries antigas no InfluxDB com a tag certa, que
> recupera o passado; (3) um *fallback* para a `/latest`, que devolve até 20 leituras do cache — 5 h
> de janela para os simulados, mas quase o histórico inteiro do sensor real, que é esparso.

Uma chamada à `/latest` repopula o Redis. Depois dela a `/all` volta a responder pela trilha de cache
hit, em vez de refazer a consulta no Influx.

---

## Infraestrutura, resumida

O detalhe está em `../tcc-backend/docs/infraestrutura-nuvem.md`.

**A API está no ar** em `https://smartfarm-tcc.chilecentral.cloudapp.azure.com` (redeploy de
17/09/2026). O Azure nunca tinha sido removido: a VM estava apenas **desalocada**.

```
Navegador ──HTTPS──▶ Caddy (443) ──▶ api-service (:3000) ──▶ Redis · InfluxDB Cloud
                                                                ▲
                  sensor-simulator ──▶ mqtt-broker ──▶ mqtt-sub ─┤ RabbitMQ ──▶ cache-service
                                                                 └───────────▶ influx-connector
```

O `api-service` **voltou do Container Apps para a VM**. Motivo: a `main` abre o cliente Redis sem
campo `Password`, e servir a API de fora exigiria publicar o Redis na VNet sem senha. Na VM ele não
tem porta no host. O Caddy reassumiu a terminação TLS, com o certificado Let's Encrypt que
sobreviveu no volume `caddy-data`. O custo da volta: uma instância só, sem o balanceamento e a
escala de 1 a 5 do Container Apps.

**As imagens da ingestão estão presas por digest** em `docker-compose.prod.yml`. A stack que
funciona é uma combinação específica de versões — `mqtt-sub` e `cache-service` de 10/ago, que leem o
broker próprio, e `influx-connector` de 10/jun. Publicar a `main` desses repositórios troca a
ingestão pela do network server e **apaga a única fonte de dados que existe**, já que o sensor real
está mudo. O CI de cada repo foi restaurado e volta a publicar `:latest` no GHCR, mas produção só
anda quando alguém troca o digest conscientemente.

**Existe um sensor LoRa real:** o `2026-tcc-cmd03` (`devEUI 5e76ce4fd99eefe3`, `devAddr d99eefe3`),
via `networkserver2.maua.br`. **Ele está mudo desde 09/09/2026**, com bateria 0% na última leitura —
dado verdadeiro, não bug. E **ninguém o está ingerindo**: a imagem do `mqtt-sub` na VM lê o broker
próprio, não o network server (zero ocorrências de `application/` nos logs).

> **O dono dele no Supabase é o Murilo** (`auth0|6a7cc285789142a48d967710`) desde 12/08. A tabela
> `users` usa um **underscore no fim do devEUI como chave liga/desliga**: o `findUserId` busca com
> `ILIKE '%"devEUI": "5e76…"%'` e devolve `results[0]`, então só pode haver **um produtor ativo por
> vez** — com dois, o dono das leituras passa a depender da ordem física das linhas. O Breno e o
> Bruno têm o mesmo devEUI cadastrado com `_`, desativados. As 30 leituras históricas ficaram sob
> `ausdgsaduUSERIDajbd`, de um cadastro anterior.

**Branches:** `dev` é a de trabalho e faz deploy automático. `prod` está 18 commits atrás e sem
integração com backend — ao promovê-la, é obrigatório configurar a `VITE_API_BASE_URL` do ambiente
`production` no GitHub, senão o site sobe e não mostra sensor nenhum.

---

## Armadilhas conhecidas

**`npm run tsc` não checa nada.** O `tsconfig.json` é solution file com `files: []` e `references`, e
sem `-b` o compilador não entra nos projetos referenciados. Use sempre:

```bash
npx tsc --noEmit -p tsconfig.app.json
```

**As variáveis `VITE_*` são gravadas dentro do JavaScript no build.** Não existe servidor lendo
configuração em tempo de execução. Trocar a variável no GitHub não surte efeito até um deploy novo. E
elas vêm de *Variables* do ambiente no GitHub, não do repositório — o `.env` é gitignored.

**O deploy do back-end é intermitente.** Já aconteceu de a imagem ser publicada no GHCR e o container
continuar o antigo. Antes de dar algo como concluído, confira o que está rodando de fato.

**Sessões antigas guardam o bundle antigo.** Ao depurar relato de usuário, confirme o hash do bundle
(`/assets/index-XXXX.js`) — um print pode ser de uma versão anterior.

---

## Convenções de código

**Tipagem** — `interface` para props, nunca `any`. Use `unknown` com narrowing.

**Componentes** — arrow functions, um por arquivo, named export (exceto páginas). PascalCase para
componentes, kebab-case para utilitários e hooks.

**Estilo** — só Tailwind, sem CSS modules. Classes condicionais com `cn()`. Tokens de cor em
`src/app/styles/tokens.css`, mapeados em `index.css`.

**Comentários** — em português, explicando **por que**, não o quê. Vale especialmente quando o código
parece estranho: um shim que aceita dois nomes de campo, uma altura fixa que existe para evitar
deslocamento, um `strokeWidth` deliberadamente ausente. Sem esse tipo de comentário, a próxima pessoa
"limpa" o código e reintroduz o bug.

**Movimento** — a linguagem de animação é `cubic-bezier(0.2, 0.7, 0.3, 1)`, fades curtos com
deslocamento pequeno para cima, e texto entrando escalonado depois do container. Respeite
`prefers-reduced-motion`.

---

## Fora do escopo deste repositório

- Código do back-end, firmware, app mobile
- Integração LoRa e network server
- Painel administrativo
- Multi-tenant (é responsabilidade do back-end)
