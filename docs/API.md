# xSwap API Reference

Base URL: `https://api.xswap.xyz` (production)

## Authentication

### Human Users
```
Authorization: Bearer <session_token>
```

### Bots
```
X-API-KEY: <api_key>
X-API-SECRET: <api_secret>
```

---

## Human Endpoints

### POST /api/auth/connect
Connect wallet and create session.

**Body:**
```json
{
  "message": "string",
  "signature": "string", 
  "address": "0x..."
}
```

**Response:**
```json
{
  "sessionToken": "string",
  "expiresIn": 3600,
  "user": { "walletAddress": "0x..." }
}
```

### GET /api/tokens
List all available tokens.

**Response:**
```json
{
  "tokens": [
    {
      "address": "0x...",
      "symbol": "MON",
      "name": "Monad",
      "decimals": 18,
      "logoUrl": "https://...",
      "priceUsd": 1.50
    }
  ]
}
```

### POST /api/swap/quote
Get swap quote.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "tokenIn": "0x...",
  "tokenOut": "0x...",
  "amount": "1000000000000000000",
  "slippage": 0.5
}
```

**Response:**
```json
{
  "outputAmount": "string",
  "route": [...],
  "priceImpact": 0.1,
  "platformFee": "string",
  "userReceives": "string",
  "unsignedTx": { ... },
  "quoteId": "string"
}
```

### POST /api/swap/execute
Execute signed swap.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "signedTx": "0x...",
  "quoteId": "string"
}
```

**Response:**
```json
{
  "txHash": "0x...",
  "status": "pending",
  "explorerUrl": "https://monadvision.com/tx/0x..."
}
```

### GET /api/portfolio/balances
Get user token balances.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "balances": [
    {
      "token": { "symbol": "MON", ... },
      "balance": "1000000000000000000",
      "valueUsd": 1.50
    }
  ],
  "totalValueUsd": 150.00
}
```

### GET /api/history
Get transaction history.

**Headers:** `Authorization: Bearer <token>`

**Query:** `?limit=50&offset=0`

**Response:**
```json
{
  "transactions": [...],
  "total": 100
}
```

---

## Bot Endpoints

### POST /api/bot/register
Register bot and get API credentials.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "botName": "MyBot",
  "walletAddress": "0x..."
}
```

**Response:**
```json
{
  "apiKey": "string",
  "apiSecret": "string",
  "walletAddress": "0x..."
}
```

### POST /api/bot/quote
Get quote for bot.

**Headers:** `X-API-KEY`, `X-API-SECRET`

Same request/response as `/api/swap/quote`.

### POST /api/bot/execute
Execute signed swap for bot.

**Headers:** `X-API-KEY`, `X-API-SECRET`

Same request/response as `/api/swap/execute`.

### GET /api/bot/history
Get bot transaction history.

**Headers:** `X-API-KEY`, `X-API-SECRET`

### POST /api/bot/regenerate-key
Regenerate API credentials.

**Headers:** `X-API-KEY`, `X-API-SECRET`

**Response:**
```json
{
  "apiKey": "new_key",
  "apiSecret": "new_secret"
}
```

---

## Error Responses

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "You don't have enough MON for this swap."
  }
}
```

## Rate Limits

- Human users: 100 req/min
- Bots: 60 req/min (configurable)
