# Integração Front-end — SmartFarm API

## Autenticação

Todas as rotas exigem autenticação via Auth0. O token JWT deve ser enviado em **todas** as requisições no header `Authorization`:

```
Authorization: Bearer <access_token>
```

### Como obter o token com o Auth0 React SDK

```js
import { useAuth0 } from "@auth0/auth0-react";

const { getAccessTokenSilently } = useAuth0();

const token = await getAccessTokenSilently({
  authorizationParams: {
    audience: "<AUTH0_AUDIENCE>", // ex: https://api.smartfarm.com
  },
});
```

> O `audience` deve ser o mesmo configurado na API do painel do Auth0. Sem ele, o token retornado é opaco e o back-end não consegue validá-lo.

### Erros de autenticação

| Status | Corpo                                       | Causa                                                      |
| ------ | ------------------------------------------- | ---------------------------------------------------------- |
| `401`  | `{ "error": "token ausente" }`              | Header `Authorization` não enviado                         |
| `401`  | `{ "error": "token inválido ou expirado" }` | Token com assinatura inválida, expirado ou audience errado |

---

## Base URL

```
http://localhost:3000
```

---

## Rotas

### GET `/api/sensors/:days/:deviceId`

Retorna o histórico de leituras de um sensor específico.

**Parâmetros de rota:**

| Parâmetro  | Tipo           | Descrição                                            |
| ---------- | -------------- | ---------------------------------------------------- |
| `days`     | número inteiro | Quantos dias atrás buscar (ex: `7` = últimos 7 dias) |
| `deviceId` | string         | ID do dispositivo sensor                             |

**O `userId` não vai na URL.** O back-end extrai automaticamente do JWT.

**Exemplo de requisição:**

```js
const res = await fetch(`http://localhost:3000/api/sensors/7/sensor-abc123`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
```

**Exemplo de resposta (`200`):**

```json
[
  {
    "timestamp": 1747044000,
    "userId": "auth0|64f3a1b2c3d4e5f6a7b8c9d0",
    "deviceId": "sensor-abc123",
    "deviceType": "solo",
    "value": {
      "temperatura": 24.5,
      "umidade": 68.2,
      "ph": 6.8
    }
  },
  {
    "timestamp": 1747044300,
    "userId": "auth0|64f3a1b2c3d4e5f6a7b8c9d0",
    "deviceId": "sensor-abc123",
    "deviceType": "solo",
    "value": {
      "temperatura": 24.8,
      "umidade": 67.9,
      "ph": 6.7
    }
  }
]
```

**Campos da resposta:**

| Campo               | Tipo                      | Descrição                  |
| ------------------- | ------------------------- | -------------------------- |
| `timestamp`         | Unix timestamp (segundos) | Momento da leitura         |
| `userId`            | string                    | ID Auth0 do dono do sensor |
| `deviceId`          | string                    | ID do dispositivo          |
| `deviceType`        | string                    | Tipo do dispositivo        |
| `value.temperatura` | float                     | Temperatura em °C          |
| `value.umidade`     | float                     | Umidade relativa em %      |
| `value.ph`          | float                     | Nível de pH                |

> Nem todos os campos de `value` são garantidos — depende do que o sensor enviou naquele instante.

**Erros:**

| Status | Causa                                                 |
| ------ | ----------------------------------------------------- |
| `500`  | Erro na query ao InfluxDB (mensagem de erro incluída) |

---

### GET `/api/sensors/latest`

Retorna as mensagens mais recentes da fila do RabbitMQ do usuário autenticado.

**Sem parâmetros de rota.** O `userId` vem do JWT.

**Exemplo de requisição:**

```js
const res = await fetch(`http://localhost:3000/api/sensors/latest`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
```

**Exemplo de resposta (`200`):**

```json
{
  "status": "success",
  "messages_count": 3,
  "queue_total": 3,
  "data": [
    {
      "userId": "auth0|64f3a1b2c3d4e5f6a7b8c9d0",
      "deviceType": "solo",
      "deviceId": "sensor-abc123",
      "payload": {
        "temperatura": 25.1,
        "umidade": 65.0,
        "ph": 6.9
      }
    }
  ]
}
```

**Campos da resposta:**

| Campo               | Tipo   | Descrição                                                                             |
| ------------------- | ------ | ------------------------------------------------------------------------------------- |
| `status`            | string | Sempre `"success"` em caso de sucesso                                                 |
| `messages_count`    | número | Quantidade de mensagens retornadas                                                    |
| `queue_total`       | número | Total de mensagens na fila (pode ser maior que `messages_count` se houver mais de 50) |
| `data`              | array  | Lista de mensagens do sensor                                                          |
| `data[].userId`     | string | ID Auth0 do dono                                                                      |
| `data[].deviceType` | string | Tipo do dispositivo                                                                   |
| `data[].deviceId`   | string | ID do dispositivo                                                                     |
| `data[].payload`    | object | Leituras do sensor (estrutura pode variar por tipo de sensor)                         |

**Erros:**

| Status | Causa                                      |
| ------ | ------------------------------------------ |
| `404`  | Fila do usuário não encontrada no RabbitMQ |
| `500`  | Erro ao acessar o barramento               |

---

## Resumo rápido

| Rota                               | Usa      | Para                                       |
| ---------------------------------- | -------- | ------------------------------------------ |
| `GET /api/sensors/:days/:deviceId` | InfluxDB | Histórico de um sensor (gráficos, análise) |
| `GET /api/sensors/latest`          | RabbitMQ | Leitura em tempo real do usuário logado    |
