# xSwap Bot Skill

Swap tokens on Monad blockchain via xSwap with Kuru DEX integration.

## Installation

```bash
npm install ethers
```

## Configuration

Set the following environment variables:

```bash
XSWAP_API_KEY=xsk_your_api_key
XSWAP_API_SECRET=xss_your_api_secret
BOT_PRIVATE_KEY=0x_your_private_key
XSWAP_API_URL=https://api.xswap.io  # Optional, defaults to production
```

## Usage

### Get Token List

```typescript
import xswap from "./index";

const tokens = await xswap.getTokenList();
console.log(tokens);
```

### Check Balance

```typescript
// All balances
const balances = await xswap.getBalance();

// Specific token
const monBalance = await xswap.getBalance("MON");
```

### Get Quote

```typescript
const quote = await xswap.getQuote("1", "MON", "USDC");
console.log(`1 MON = ${quote.userReceivesFormatted} USDC`);
```

### Execute Swap

```typescript
const result = await xswap.executeSwap("1", "MON", "USDC", 0.5);
console.log(`Swap completed: ${result.explorerUrl}`);
```

### View History

```typescript
const history = await xswap.getHistory(10);
console.log(history.transactions);
```

## Commands

| Command   | Description          | Example               |
| --------- | -------------------- | --------------------- |
| `swap`    | Execute a token swap | `swap 1 MON to USDC`  |
| `balance` | Check wallet balance | `balance MON`         |
| `quote`   | Get price quote      | `quote 1 MON to USDC` |
| `history` | View transactions    | `history 10`          |

## Security

⚠️ **IMPORTANT**:

- `BOT_PRIVATE_KEY` must NEVER be shared or sent to any server
- Only sign transactions locally
- Keep `XSWAP_API_SECRET` secure
- Only use API keys from official xSwap dashboard

## Disclaimer

This skill interacts with smart contracts on Monad mainnet. Use at your own risk. xSwap is not responsible for any financial losses.

## Support

- Documentation: https://xswap.io/docs
- Discord: https://discord.gg/xswap
- Twitter: @xSwap_io
