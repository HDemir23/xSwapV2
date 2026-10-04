export type { Token } from './token';
export type { Quote } from './quote';
export type { Balance } from './balance';
export type { Transaction } from './transaction';
export type { 
  ApiResponse, 
  ApiError, 
  PaginationQuery, 
  PaginatedResponse 
} from './api';
export type {
  AuthMessageResponse,
  ConnectWalletRequest,
  ConnectWalletResponse,
  BotRegisterRequest,
  BotRegisterResponse
} from './auth';
export type {
  QuoteRequest,
  ExecuteSwapRequest,
  AllowanceResponse,
  ApprovalTxResponse,
  ExecuteSwapResponse
} from './swap';

import type { Token } from './token';
import type { Quote } from './quote';

export interface SwapState {
  tokenIn: Token | null;
  tokenOut: Token | null;
  amountIn: string;
  slippage: number;
  quote: Quote | null;
  isLoading: boolean;
  error: string | null;
}
