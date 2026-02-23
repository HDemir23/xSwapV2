export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  priceUsd?: number;
  isNative?: boolean;
}

export interface Quote {
  outputAmount: string;
  outputAmountFormatted: string;
  route: string;
  priceImpact: string;
  platformFee: string;
  platformFeeFormatted: string;
  userReceives: string;
  userReceivesFormatted: string;
  price: string;
  unsignedTx?: any;
  quoteId: string;
  expiresAt: number;
}

export interface Balance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  valueUsd?: number;
}

export interface Transaction {
  id: string;
  txHash: string;
  type: string;
  tokenIn: { symbol: string; address: string; amount: string };
  tokenOut: { symbol: string; address: string; amount: string };
  fee: { amount: string; token: string };
  status: string;
  createdAt: string;
  explorerUrl: string;
}

export interface SwapState {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  slippage: number;
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
}

export const NATIVE_MON_ADDRESS = "0x0000000000000000000000000000000000000000";

export const DEFAULT_SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0] as const;
