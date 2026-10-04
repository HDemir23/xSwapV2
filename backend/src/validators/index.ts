import { z } from 'zod';

export const walletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address');

export const addressParamSchema = z.object({
  address: walletAddressSchema,
});

export const tokenParamSchema = z.object({
  token: walletAddressSchema,
});

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const quoteRequestSchema = z.object({
  tokenIn: walletAddressSchema,
  tokenOut: walletAddressSchema,
  amount: z.string().min(1),
  slippage: z.coerce.number().min(0).max(100).default(0.5),
});

export const executeRequestSchema = z.object({
  signedTx: z.string().min(1),
  quoteId: z.string().min(1),
});

export const botRegisterSchema = z.object({
  botName: z.string().min(1).max(100).optional(),
  walletAddress: walletAddressSchema,
});

export const authMessageSchema = z.object({
  address: walletAddressSchema,
});

export const connectWalletSchema = z.object({
  address: walletAddressSchema,
  message: z.string().min(1),
  signature: z.string().min(1),
});
