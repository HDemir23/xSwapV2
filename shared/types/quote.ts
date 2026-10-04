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
