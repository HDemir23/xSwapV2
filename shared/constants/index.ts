export { NATIVE_MON_ADDRESS, WMON_ADDRESS } from './addresses';
export { 
  MONAD_CHAIN_ID, 
  MONAD_RPC_URL, 
  MONAD_BLOCK_EXPLORER,
  KURU_CONTRACTS
} from './chain';

export const DEFAULT_SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0] as const;
export const QUOTE_REFRESH_INTERVAL_MS = 10000;
export const PLATFORM_FEE_BPS = 50;

export const API_ENDPOINTS = {
  AUTH_MESSAGE: '/api/auth/message',
  AUTH_CONNECT: '/api/auth/connect',
  AUTH_DISCONNECT: '/api/auth/disconnect',
  TOKENS: '/api/tokens',
  SWAP_QUOTE: '/api/swap/quote',
  SWAP_EXECUTE: '/api/swap/execute',
  SWAP_ALLOWANCE: '/api/swap/allowance',
  APPROVE: '/api/approve',
  PORTFOLIO_BALANCES: '/api/portfolio/balances',
  HISTORY: '/api/history',
  BOT_REGISTER: '/api/bot/register',
  BOT_QUOTE: '/api/bot/quote',
  BOT_EXECUTE: '/api/bot/execute',
} as const;
