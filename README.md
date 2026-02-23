# xSwap

> Swap tokens on Monad with AI-powered best prices via Kuru DEX

## Features

- 🌸 **Sakura Theme** - Beautiful cherry blossom inspired UI
- 💱 **Token Swaps** - Swap any token on Monad via Kuru
- 🤖 **Bot API** - Full API for AI bot integration
- 💰 **0.5% Fee** - Transparent platform fee
- 🔐 **Secure** - Private keys never leave your device

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Monad wallet

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
xswap/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   └── middleware/
│   └── prisma/       # Database schema
├── frontend/         # Next.js app
├── bot-skills/       # ClawBot integration
└── docs/             # Documentation
```

## API Endpoints

### Human Users

- `POST /api/auth/connect` - Connect wallet
- `GET /api/tokens` - Get token list
- `POST /api/swap/quote` - Get swap quote
- `POST /api/swap/execute` - Execute swap
- `GET /api/portfolio/balances` - Get balances
- `GET /api/history` - Transaction history

### Bot API

- `POST /api/bot/register` - Register bot
- `POST /api/bot/quote` - Bot quote
- `POST /api/bot/execute` - Bot execute
- `GET /api/bot/history` - Bot history

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
KURU_API_URL=https://ws.kuru.io
FEE_WALLET_ADDRESS=0x...
PLATFORM_FEE_BPS=50
JWT_SECRET=your-secret
MONAD_RPC_URL=https://rpc.monad.xyz
```

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, RainbowKit, Wagmi
- **Backend**: Express, TypeScript, Prisma, PostgreSQL
- **DEX**: Kuru (Monad)
- **Blockchain**: Monad

## License

MIT

## Disclaimer

**USE AT YOUR OWN RISK**

xSwap is provided "as is" without any warranties. Trading cryptocurrencies involves substantial risk. xSwap is NOT liable for any financial losses.

This is hackathon software and may contain bugs.
