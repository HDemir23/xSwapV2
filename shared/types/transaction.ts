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
