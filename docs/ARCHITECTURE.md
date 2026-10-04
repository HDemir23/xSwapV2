# xSwap Architecture

## Overview

xSwap is an AI-powered DEX gateway for Monad blockchain via Kuru.

```
User/Bot → xSwap Platform → Kuru API → Blockchain
               ↓ (0.5% fee)
          Fee Wallet
```

## Project Structure

```
xswap/
├── frontend/          # Next.js 14 App Router
│   └── src/
│       ├── app/       # Routes (swap, portfolio, history, docs)
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── utils/
│
├── backend/           # Express API Server
│   └── src/
│       ├── routes/    # API endpoints
│       ├── services/  # Business logic
│       ├── middleware/
│       └── utils/
│
├── shared/            # Shared types & constants
├── bot-skills/        # ClawBot integration
└── docs/              # Documentation
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Wagmi, RainbowKit
- **Backend**: Express, Prisma, PostgreSQL
- **Blockchain**: Monad, Kuru DEX, ethers.js, viem
- **Tooling**: Turborepo, TypeScript

## Key Flows

### Swap Flow (Human)
1. Connect wallet → Create session
2. Select tokens + amount
3. Auto-refresh quote every 10-15s
4. Check/set allowance (skip for native MON)
5. Sign and submit transaction
6. Track status → Show explorer link

### Swap Flow (Bot)
1. Register → Get API Key + Secret
2. Call `/api/bot/quote` with credentials
3. Receive unsigned transaction data
4. Sign locally with private key
5. Submit to `/api/bot/execute`

## Environment Variables

See `.env.example` files in each package.
