import type { Token } from './token';

export interface Balance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  valueUsd?: number;
}
