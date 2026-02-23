const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

class ApiClient {
  private baseUrl: string;
  private sessionToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.sessionToken = localStorage.getItem("xswap_session");
    }
  }

  setSession(token: string) {
    this.sessionToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("xswap_session", token);
    }
  }

  clearSession() {
    this.sessionToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("xswap_session");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.sessionToken) {
      headers["Authorization"] = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getAuthMessage(
    address: string,
  ): Promise<{ message: string; nonce: string }> {
    return this.request("/api/auth/message", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  }

  async connectWallet(
    address: string,
    message: string,
    signature: string,
  ): Promise<{
    sessionToken: string;
    expiresIn: number;
    user: { id: string; address: string };
  }> {
    const result = await this.request<{
      sessionToken: string;
      expiresIn: number;
      user: { id: string; address: string };
    }>("/api/auth/connect", {
      method: "POST",
      body: JSON.stringify({ address, message, signature }),
    });
    this.setSession(result.sessionToken);
    return result;
  }

  async disconnect(): Promise<void> {
    await this.request("/api/auth/disconnect", { method: "POST" });
    this.clearSession();
  }

  async getTokens(): Promise<{ tokens: Token[] }> {
    return this.request("/api/tokens");
  }

  async getQuote(
    tokenIn: string,
    tokenOut: string,
    amount: string,
    slippage: number,
  ): Promise<Quote> {
    return this.request("/api/swap/quote", {
      method: "POST",
      body: JSON.stringify({ tokenIn, tokenOut, amount, slippage }),
    });
  }

  async executeSwap(
    signedTx: string,
    quoteId: string,
  ): Promise<{
    txHash: string;
    status: string;
    explorerUrl: string;
  }> {
    return this.request("/api/swap/execute", {
      method: "POST",
      body: JSON.stringify({ signedTx, quoteId }),
    });
  }

  async checkAllowance(
    token: string,
    amount: string,
  ): Promise<{
    needsApproval: boolean;
    currentAllowance: string;
  }> {
    return this.request(`/api/swap/allowance/${token}?amount=${amount}`);
  }

  async getApprovalTx(
    token: string,
    amount?: string,
  ): Promise<{ transaction: any }> {
    return this.request(`/api/approve/${token}`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  async getBalances(): Promise<{ balances: Balance[]; totalValueUsd: number }> {
    return this.request("/api/portfolio/balances");
  }

  async getHistory(
    limit = 50,
    offset = 0,
  ): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    return this.request(`/api/history?limit=${limit}&offset=${offset}`);
  }

  isAuthenticated(): boolean {
    return !!this.sessionToken;
  }
}

export const apiClient = new ApiClient(API_BASE);
