/**
 * Kuru API Service
 * Handles communication with the Kuru DEX API for JWT authentication and quotes
 *
 * API Endpoints:
 * - JWT Token: POST https://ws.kuru.io/api/generate-token
 * - Quote: POST https://ws.kuru.io/api/quote
 */

import { config } from "../config";

/** JWT Token response from Kuru API */
export interface JwtTokenResponse {
  token: string;
  expires_at: number;
  rate_limit: {
    rps: number;
    burst: number;
  };
}

/** Request parameters for Kuru quote */
export interface KuruQuoteRequest {
  /** User wallet address */
  userAddress: string;
  /** Input token address */
  tokenIn: string;
  /** Output token address */
  tokenOut: string;
  /** Amount in wei as string */
  amount: string;
  /** Slippage tolerance in basis points (e.g., 50 = 0.5%) */
  slippageTolerance: number;
  /** Enable automatic slippage adjustment */
  autoSlippage?: boolean;
  /** Referrer address for fee collection */
  referrerAddress?: string;
  /** Referrer fee in basis points (50 = 0.5% fee) */
  referrerFeeBps?: number;
}

/** Build response containing transaction data */
export interface KuruBuildResponse {
  /** Contract address to call */
  to: string;
  /** Encoded transaction data - API returns as 'calldata' */
  data?: string;
  /** Encoded transaction data - API returns this field name */
  calldata?: string;
  /** ETH value to send */
  value: string;
  /** Optional gas limit */
  gasLimit?: string;
}

/** Gas prices from quote response */
export interface KuruGasPrices {
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

/** Response from Kuru quote API */
export interface KuruQuoteResponse {
  /** Response type */
  type: string;
  /** Status of the quote */
  status: "success" | "error";
  /** Output amount in wei */
  output: string;
  /** Minimum output amount after slippage */
  minOut?: string;
  /** Route/path information */
  path?: any;
  /** Transaction build data - Kuru API returns this as 'transaction' */
  transaction: KuruBuildResponse;
  /** Gas price information */
  gasPrices: KuruGasPrices;
  /** Error message if status is 'error' */
  error?: string;
}

/** Cached JWT token entry */
interface CachedToken {
  token: string;
  expiresAt: number;
}

/** API base URL */
const KURU_API_BASE = "https://ws.kuru.io/api";

/**
 * KuruApiService
 *
 * Service for interacting with Kuru DEX API.
 * Handles JWT token caching and quote requests.
 */
export class KuruApiService {
  /** Cache for JWT tokens keyed by user address */
  private tokenCache: Map<string, CachedToken> = new Map();

  /** Token refresh buffer in milliseconds (5 minutes before expiry) */
  private readonly TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

  /**
   * Get a JWT token for the specified user address.
   * Returns cached token if valid, otherwise fetches a new one.
   *
   * @param userAddress - The user's wallet address
   * @returns JWT token string
   * @throws Error if token generation fails
   */
  async getJwtToken(userAddress: string): Promise<string> {
    const normalizedAddress = userAddress.toLowerCase();
    const cached = this.tokenCache.get(normalizedAddress);

    // Return cached token if still valid (with buffer)
    if (cached && cached.expiresAt > Date.now() + this.TOKEN_REFRESH_BUFFER) {
      console.log(
        `[KuruApiService] Using cached JWT token for ${normalizedAddress}`,
      );
      return cached.token;
    }

    console.log(
      `[KuruApiService] Fetching new JWT token for ${normalizedAddress}`,
    );

    try {
      const response = await fetch(`${KURU_API_BASE}/generate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_address: normalizedAddress,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `JWT token request failed: ${response.status} - ${errorText}`,
        );
      }

      const data = (await response.json()) as JwtTokenResponse;

      // Cache the token
      this.tokenCache.set(normalizedAddress, {
        token: data.token,
        expiresAt: data.expires_at * 1000, // Convert to milliseconds
      });

      console.log(
        `[KuruApiService] JWT token cached for ${normalizedAddress}, expires at ${new Date(data.expires_at * 1000).toISOString()}`,
      );

      return data.token;
    } catch (error) {
      console.error("[KuruApiService] Error fetching JWT token:", error);
      throw error;
    }
  }

  /**
   * Get a quote from Kuru DEX.
   * Automatically handles JWT authentication.
   *
   * @param params - Quote request parameters
   * @returns Quote response with output amount and transaction data
   * @throws Error if quote request fails
   */
  async getQuote(params: KuruQuoteRequest): Promise<KuruQuoteResponse> {
    const {
      userAddress,
      tokenIn,
      tokenOut,
      amount,
      slippageTolerance,
      autoSlippage,
      referrerAddress,
      referrerFeeBps,
    } = params;

    // Get JWT token for authentication
    const jwtToken = await this.getJwtToken(userAddress);

    // Build request body - API expects camelCase field names
    const requestBody: Record<string, any> = {
      userAddress: userAddress.toLowerCase(),
      tokenIn: tokenIn.toLowerCase(),
      tokenOut: tokenOut.toLowerCase(),
      amount: amount,
      slippageTolerance: slippageTolerance,
      autoSlippage: autoSlippage ?? true, // Required field, default to true
    };

    // Add referrer info if configured in app or provided in params
    const effectiveReferrer = referrerAddress || config.fee.walletAddress;
    const effectiveFeeBps = referrerFeeBps ?? config.fee.bps;

    if (effectiveReferrer && effectiveFeeBps > 0) {
      requestBody.referrerAddress = effectiveReferrer.toLowerCase();
      requestBody.referrerFeeBps = effectiveFeeBps;
    }

    console.log(
      `[KuruApiService] Requesting quote: ${tokenIn} -> ${tokenOut}, amount: ${amount}`,
    );

    try {
      const response = await fetch(`${KURU_API_BASE}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as KuruQuoteResponse;

      if (!response.ok || data.status === "error") {
        const errorMessage =
          data.error || `Quote request failed: ${response.status}`;
        console.error("[KuruApiService] Quote error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log(`[KuruApiService] Quote received: output=${data.output}`);

      return data;
    } catch (error) {
      console.error("[KuruApiService] Error fetching quote:", error);
      throw error;
    }
  }

  /**
   * Clear cached JWT token for a specific user or all users.
   *
   * @param userAddress - Optional user address. If not provided, clears all cached tokens.
   */
  clearTokenCache(userAddress?: string): void {
    if (userAddress) {
      this.tokenCache.delete(userAddress.toLowerCase());
      console.log(`[KuruApiService] Cleared cached token for ${userAddress}`);
    } else {
      this.tokenCache.clear();
      console.log("[KuruApiService] Cleared all cached tokens");
    }
  }
}

/** Singleton instance of KuruApiService */
export const kuruApiService = new KuruApiService();
