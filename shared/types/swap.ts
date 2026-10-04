export interface QuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage: number;
}

export interface ExecuteSwapRequest {
  signedTx: string;
  quoteId: string;
}

export interface AllowanceResponse {
  needsApproval: boolean;
  currentAllowance: string;
}

export interface ApprovalTxResponse {
  transaction: unknown;
}

export interface ExecuteSwapResponse {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  explorerUrl: string;
}
