import { ethers } from "ethers";

const API_URL = process.env.XSWAP_API_URL || "https://api.xswap.io";
const API_KEY = process.env.XSWAP_API_KEY;
const API_SECRET = process.env.XSWAP_API_SECRET;
const PRIVATE_KEY = process.env.BOT_PRIVATE_KEY;

if (!API_KEY || !API_SECRET || !PRIVATE_KEY) {
  throw new Error(
    "Missing required environment variables: XSWAP_API_KEY, XSWAP_API_SECRET, BOT_PRIVATE_KEY",
  );
}

const provider = new ethers.providers.JsonRpcProvider("https://rpc.monad.xyz");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const NATIVE_MON = "0x0000000000000000000000000000000000000000";

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY!,
      "X-API-SECRET": API_SECRET!,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }

  return response.json();
}

export async function getTokenList(): Promise<any[]> {
  const response = await apiRequest("/api/tokens");
  return response.tokens;
}

export async function getBalance(tokenSymbol?: string): Promise<any> {
  if (tokenSymbol) {
    const tokens = await getTokenList();
    const token = tokens.find(
      (t: any) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase(),
    );
    if (!token) throw new Error(`Token ${tokenSymbol} not found`);
    return apiRequest(`/api/portfolio/balance/${token.address}`);
  }
  return apiRequest("/api/portfolio/balances");
}

export async function getQuote(
  amount: string,
  fromToken: string,
  toToken: string,
  slippage: number = 0.5,
): Promise<any> {
  const tokens = await getTokenList();

  const from = tokens.find(
    (t: any) => t.symbol.toUpperCase() === fromToken.toUpperCase(),
  );
  const to = tokens.find(
    (t: any) => t.symbol.toUpperCase() === toToken.toUpperCase(),
  );

  if (!from) throw new Error(`Token ${fromToken} not found`);
  if (!to) throw new Error(`Token ${toToken} not found`);

  const amountWei = ethers.utils.parseUnits(amount, from.decimals).toString();

  const response = await apiRequest("/api/swap/quote", {
    method: "POST",
    body: JSON.stringify({
      tokenIn: from.address,
      tokenOut: to.address,
      amount: amountWei,
      slippage,
    }),
  });

  return {
    ...response,
    inputAmount: amount,
    inputToken: fromToken,
    outputToken: toToken,
  };
}

export async function executeSwap(
  amount: string,
  fromToken: string,
  toToken: string,
  slippage: number = 0.5,
): Promise<any> {
  const quote = await getQuote(amount, fromToken, toToken, slippage);

  if (!quote.unsignedTx) {
    throw new Error("No transaction data in quote response");
  }

  const tokens = await getTokenList();
  const from = tokens.find(
    (t: any) => t.symbol.toUpperCase() === fromToken.toUpperCase(),
  );

  if (from && from.address !== NATIVE_MON) {
    const allowanceCheck = await apiRequest(
      `/api/swap/allowance/${from.address}?amount=${ethers.utils.parseUnits(amount, from.decimals)}`,
    );

    if (allowanceCheck.needsApproval) {
      console.log(`[xSwap] Approving ${fromToken}...`);
      const approveData = await apiRequest(`/api/approve/${from.address}`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      const approveTx = await wallet.sendTransaction(approveData.transaction);
      await approveTx.wait();
      console.log(`[xSwap] Approval confirmed: ${approveTx.hash}`);
    }
  }

  console.log("[xSwap] Signing transaction...");
  const tx = await wallet.sendTransaction(quote.unsignedTx);
  console.log(`[xSwap] Transaction sent: ${tx.hash}`);

  const receipt = await tx.wait();
  console.log(
    `[xSwap] Transaction confirmed: ${receipt.status === 1 ? "Success" : "Failed"}`,
  );

  const result = await apiRequest("/api/swap/execute", {
    method: "POST",
    body: JSON.stringify({
      signedTx: tx.raw,
      quoteId: quote.quoteId,
    }),
  });

  return {
    txHash: result.txHash,
    status: result.status,
    inputAmount: amount,
    inputToken: fromToken,
    outputAmount: quote.userReceivesFormatted,
    outputToken: toToken,
    explorerUrl: result.explorerUrl,
  };
}

export async function getHistory(limit: number = 10): Promise<any> {
  return apiRequest(`/api/bot/history?limit=${limit}`);
}

export default {
  getTokenList,
  getBalance,
  getQuote,
  executeSwap,
  getHistory,
};
