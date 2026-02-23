# xSwap - Implementation Plan

> Monad Hackathon Project - AI-Powered DEX Gateway for Monad via Kuru

## Project Overview

- **Name:** xSwap
- **Platform:** Next.js 14 + Express Backend
- **DEX:** Kuru (Monad-specific CLOB + AMM)
- **Revenue Model:** 0.5% Platform Fee
- **Target Users:** Human Users + AI Bots (ClawBot/NanoBot)

---

## Key Decisions

| #   | Topic           | Decision                                                     |
| --- | --------------- | ------------------------------------------------------------ |
| 1   | Token Discovery | Query `MarketRegistered` events from Router deployment block |
| 2   | MON vs WMON     | Native MON support, no wrapping needed                       |
| 3   | Allowance Check | Yes - essential for ERC20, skip for native MON               |
| 4   | Gas Display     | None for MVP (Monad gas is cheap)                            |
| 5   | Quote Refresh   | Auto-refresh every 10-15s                                    |
| 6   | TX Tracking     | `tx.wait()` on frontend + explorer link                      |
| 7   | Bot Wallet      | Bot provides own address, local signing                      |
| 8   | API Key Regen   | Yes - can regenerate                                         |
| 9   | Rate Limiting   | Basic per-IP/per-key + queue for Kuru                        |
| 10  | Error Messages  | Comprehensive user-friendly mapping                          |

---

## Monad Mainnet Configuration

```typescript
export const MONAD_CONFIG = {
  chainId: 143,
  chainName: "Monad Mainnet",
  rpcUrl: "https://rpc.monad.xyz",
  blockExplorer: "https://monadvision.com",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  wrappedNative: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A", // WMON
};

export const KURU_CONTRACTS = {
  router: "0xd651346d7c789536ebf06dc72aE3C8502cd695CC",
  marginAccount: "0x2A68ba1833cDf93fa9Da1EEbd7F46242aD8E90c5",
  kuruFlowEntrypoint: "0xb3e6778480b2E488385E8205eA05E20060B813cb",
  kuruFlowRouter: "0x0d3a1BE29E9dEd63c7a5678b31e847D68F71FFa2",
};

export const KURU_API = {
  baseUrl: "https://ws.kuru.io",
  generateToken: "/api/generate-token",
  quote: "/api/quote",
};
```

---

## Architecture

### Fee Model (Relayer Model)

```
User/Bot → xSwap Platform → Kuru API → Blockchain
              ↓ (0.5% fee via referrerAddress)
         Fee Wallet
```

### Token Discovery Flow

```
Backend Startup:
1. Query Router deployment block from explorer
2. Scan MarketRegistered events [deployment_block] → [current_block]
3. Extract unique token addresses
4. Store markets + tokens in database
5. Save last_indexed_block = current_block

On Restart:
1. Read last_indexed_block from database
2. Scan events [last_indexed_block] → [current_block]
3. Update database with new markets/tokens
4. Update last_indexed_block

Runtime:
- Listen for new MarketRegistered events (WebSocket)
- Auto-add new tokens to list
```

### Swap Flow (Human)

```
1. User connects wallet → Create session
2. User selects tokens + amount
3. Auto-refresh quote every 10-15s in background
4. Check allowance:
   - If native MON → Skip approval
   - If ERC20 → Check allowance(user, KuruFlowEntrypoint)
     - If insufficient → Show "Approve [TOKEN]" button
     - After approval → Show "Swap" button
5. User clicks Swap → Sign transaction in wallet
6. Submit signed TX
7. Frontend calls tx.wait()
8. Update UI: pending → confirmed/failed
9. Store transaction in database
10. Show explorer link
```

### Swap Flow (Bot)

```
1. Bot registers → Gets API Key + Secret
2. Bot provides wallet address during registration
3. Bot calls /api/bot/quote with API credentials
4. Bot receives unsigned transaction data
5. Bot signs transaction LOCALLY with own private key
6. Bot sends signed TX to /api/bot/execute
7. Backend broadcasts to Kuru
8. Backend tracks status, updates database
```

---

## Project Structure

```
xswap/
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── page.tsx            # Landing + Swap interface
│   │   │   ├── portfolio/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── docs/
│   │   │   ├── page.tsx
│   │   │   ├── getting-started/page.tsx
│   │   │   ├── api-reference/page.tsx
│   │   │   ├── bot-integration/page.tsx
│   │   │   └── disclaimer/page.tsx
│   │   ├── layout.tsx
│   │   └── providers.tsx
│   ├── components/
│   │   ├── swap/
│   │   ├── portfolio/
│   │   ├── history/
│   │   ├── layout/
│   │   ├── docs/
│   │   └── ui/
│   ├── lib/
│   ├── hooks/
│   ├── styles/
│   └── types/
│
├── backend/                         # Express API Server
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   └── prisma/
│
├── bot-skills/                      # ClawBot Integration
│   └── xswap/
│       ├── skill.json
│       ├── index.ts
│       └── README.md
│
└── README.md
```

---

## Database Schema (PostgreSQL)

```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  createdAt     DateTime @default(now())
  sessions      Session[]
  transactions  Transaction[]
  apiKeys       ApiKey[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Transaction {
  id              String   @id @default(cuid())
  userId          String
  txHash          String   @unique
  type            String
  tokenInAddress  String
  tokenInSymbol   String
  tokenInAmount   String
  tokenOutAddress String
  tokenOutSymbol  String
  tokenOutAmount  String
  feeAmount       String
  feeToken        String
  status          String   @default("pending")
  createdAt       DateTime @default(now())
}

model ApiKey {
  id         String   @id @default(cuid())
  userId     String
  apiKey     String   @unique
  apiSecret  String
  botName    String?
  walletAddress String
  isActive   Boolean  @default(true)
  lastUsedAt DateTime?
  createdAt  DateTime @default(now())
}

model Token {
  id            String   @id @default(cuid())
  address       String   @unique
  symbol        String
  name          String
  decimals      Int
  logoUrl       String?
  priceUsd      Float?
  priceUpdatedAt DateTime?
  createdAt     DateTime @default(now())
}

model MarketIndex {
  id                String   @id @default(cuid())
  lastIndexedBlock  BigInt
  updatedAt         DateTime @updatedAt
}
```

---

## API Endpoints

### Human Users

```
POST /api/auth/connect
  Body: { message, signature, address }
  Response: { sessionToken, expiresIn, user }

GET /api/tokens
  Response: { tokens: [{ address, symbol, name, decimals, logoUrl, priceUsd }] }

POST /api/swap/quote
  Headers: Authorization: Bearer <token>
  Body: { tokenIn, tokenOut, amount, slippage }
  Response: { outputAmount, route, priceImpact, platformFee, userReceives, unsignedTx, quoteId }

POST /api/swap/execute
  Headers: Authorization: Bearer <token>
  Body: { signedTx, quoteId }
  Response: { txHash, status, explorerUrl }

GET /api/portfolio/balances
  Headers: Authorization: Bearer <token>
  Response: { balances: [...], totalValueUsd }

GET /api/history?limit=50&offset=0
  Headers: Authorization: Bearer <token>
  Response: { transactions: [...], total }
```

### Bot Endpoints

```
POST /api/bot/register
  Headers: Authorization: Bearer <token>
  Body: { botName, walletAddress }
  Response: { apiKey, apiSecret, walletAddress }

POST /api/bot/quote
  Headers: X-API-KEY, X-API-SECRET
  Body: { tokenIn, tokenOut, amount, slippage }
  Response: Same as human quote

POST /api/bot/execute
  Headers: X-API-KEY, X-API-SECRET
  Body: { signedTx, quoteId }
  Response: Same as human execute

GET /api/bot/history
  Headers: X-API-KEY, X-API-SECRET
  Response: Same as human history

POST /api/bot/regenerate-key
  Headers: X-API-KEY, X-API-SECRET
  Response: { apiKey, apiSecret }
```

---

## Design System (Sakura Theme)

```css
:root {
  /* Backgrounds */
  --bg-primary: #1a1415;
  --bg-secondary: #2d2023;
  --bg-card: #3d2c30;
  --bg-hover: #4d3c40;

  /* Sakura Pinks */
  --sakura-light: #ffe4e8;
  --sakura-medium: #ffb7c5;
  --sakura-dark: #e8909c;
  --sakura-accent: #ff69b4;

  /* Text */
  --text-primary: #fff5f6;
  --text-secondary: #d4a5a9;
  --text-muted: #9d7f84;

  /* Semantic */
  --success: #7cb342;
  --warning: #ffb347;
  --error: #ff6b6b;
  --info: #87ceeb;
}
```

---

## Environment Variables

```env
# Backend .env
DATABASE_URL="postgresql://..."
KURU_API_URL="https://ws.kuru.io"
FEE_WALLET_ADDRESS="0x..."
PLATFORM_FEE_BPS=50
JWT_SECRET="..."
MONAD_RPC_URL="https://rpc.monad.xyz"
MONAD_CHAIN_ID=143
KURU_ROUTER_ADDRESS="0xd651346d7c789536ebf06dc72aE3C8502cd695CC"
KURU_FLOW_ENTRYPOINT="0xb3e6778480b2E488385E8205eA05E20060B813cb"
KURU_ROUTER_DEPLOYMENT_BLOCK="<to be found>"
FRONTEND_URL="https://xswap.vercel.app"
BOT_RATE_LIMIT_RPM=60
```

---

## Implementation Phases

### Phase 1: Project Setup (15 min)

- [ ] Create monorepo structure
- [ ] Initialize backend (Express + TypeScript + Prisma)
- [ ] Initialize frontend (Next.js 14 + Tailwind)
- [ ] Setup environment files

### Phase 2: Backend Core (2-3 hours)

- [ ] Database schema (Prisma)
- [ ] Kuru service (JWT, quote, execute)
- [ ] Market discovery service (event indexing)
- [ ] Token service (metadata, prices)
- [ ] Auth service (wallet verification)
- [ ] Routes (auth, swap, portfolio, tokens, history, bot)
- [ ] Middleware (auth, rate limiting, error handling)
- [ ] Error message mapping

### Phase 3: Frontend Core (3-4 hours)

- [ ] Wagmi + RainbowKit setup
- [ ] Sakura theme (CSS variables)
- [ ] Layout components (responsive)
- [ ] Swap interface (all components)
- [ ] Allowance check + approve flow
- [ ] Auto-refresh quotes
- [ ] TX status tracking
- [ ] Portfolio + History pages
- [ ] Docs pages (including disclaimer)

### Phase 4: Integration & Testing (1-2 hours)

- [ ] Connect frontend ↔ backend
- [ ] Test swap flow (small amount)
- [ ] Test with curl
- [ ] Mobile responsive testing
- [ ] Edge case handling

### Phase 5: Bot Integration (1 hour)

- [ ] ClawBot skill file
- [ ] Integration documentation
- [ ] Bot testing

### Phase 6: Deployment (30 min)

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure environment
- [ ] Final production test

---

## Error Messages Mapping

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  "insufficient balance": "You don't have enough {token} for this swap.",
  "insufficient allowance": "Please approve {token} first.",
  "slippage exceeded": "Price moved too much. Try increasing slippage.",
  "execution failed": "Swap failed. Your tokens are safe.",
  "network error": "Connection lost. Please try again.",
  "user rejected": "Transaction cancelled.",
  "invalid signature": "Invalid wallet signature.",
  "session expired": "Session expired. Please reconnect wallet.",
  "rate limit exceeded": "Too many requests. Please wait.",
  "token not found": "Token not found in our list.",
  "market not found": "No market available for this pair.",
  "insufficient liquidity": "Not enough liquidity for this swap.",
  "price impact too high": "Price impact too high. Try a smaller amount.",
};
```

---

## Disclaimer

**USE AT YOUR OWN RISK**

xSwap is provided "as is" without any warranties. By using xSwap, you agree that:

1. **No Guarantee**: We do not guarantee the accuracy, reliability, or availability of the service.
2. **Financial Risk**: Trading cryptocurrencies involves substantial risk.
3. **Smart Contracts**: Interacting with smart contracts carries inherent risks.
4. **No Liability**: xSwap is NOT liable for any financial losses or damages.
5. **Not Financial Advice**: Nothing constitutes financial advice.
6. **Regulatory Compliance**: You are responsible for compliance with local laws.
7. **Experimental Software**: This is hackathon software and may contain bugs.

---

## Resources

- [Kuru Docs](https://docs.kuru.io/)
- [Monad Docs](https://docs.monad.xyz/)
- [RainbowKit Docs](https://rainbowkit.com/)
- [Wagmi Docs](https://wagmi.sh/)
