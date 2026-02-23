import { ethers } from "ethers";
import { config, NATIVE_MON_ADDRESS, WMON_ADDRESS } from "../config";
import { prisma } from "../prisma";

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  priceUsd?: number;
  isNative?: boolean;
}

interface Balance {
  token: TokenInfo;
  balance: string;
  balanceFormatted: string;
  valueUsd?: number;
}

export class TokenService {
  private provider: ethers.providers.JsonRpcProvider;
  private coingeckoBaseUrl = "https://api.coingecko.com/api/v3";
  private priceCache: Map<string, { price: number; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 60000;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.monad.rpcUrl);
  }

  async getTokenList(): Promise<TokenInfo[]> {
    const tokens = await prisma.token.findMany({
      orderBy: { symbol: "asc" },
    });

    return tokens.map((token) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoUrl: token.logoUrl || undefined,
      priceUsd: token.priceUsd || undefined,
      isNative: token.isNative,
    }));
  }

  async getTokenByAddress(address: string): Promise<TokenInfo | null> {
    const normalizedAddress = address.toLowerCase();

    const token = await prisma.token.findUnique({
      where: { address: normalizedAddress },
    });

    if (!token) return null;

    return {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoUrl: token.logoUrl || undefined,
      priceUsd: token.priceUsd || undefined,
      isNative: token.isNative,
    };
  }

  async getTokenBalance(
    walletAddress: string,
    tokenAddress: string,
  ): Promise<string> {
    try {
      if (tokenAddress.toLowerCase() === NATIVE_MON_ADDRESS) {
        const balance = await this.provider.getBalance(walletAddress);
        return balance.toString();
      }

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.provider,
      );
      const balance = await tokenContract.balanceOf(walletAddress);
      return balance.toString();
    } catch (error) {
      console.error(
        `[TokenService] Error getting balance for ${tokenAddress}:`,
        error,
      );
      return "0";
    }
  }

  async getBalances(walletAddress: string): Promise<Balance[]> {
    const tokens = await this.getTokenList();
    const balances: Balance[] = [];

    for (const token of tokens) {
      try {
        const balance = await this.getTokenBalance(
          walletAddress,
          token.address,
        );
        const balanceBN = ethers.BigNumber.from(balance);

        if (balanceBN.gt(0)) {
          const balanceFormatted = ethers.utils.formatUnits(
            balance,
            token.decimals,
          );

          balances.push({
            token,
            balance,
            balanceFormatted,
            valueUsd: token.priceUsd
              ? parseFloat(balanceFormatted) * token.priceUsd
              : undefined,
          });
        }
      } catch (error) {
        console.error(
          `[TokenService] Error processing token ${token.symbol}:`,
          error,
        );
      }
    }

    return balances;
  }

  async checkAllowance(
    walletAddress: string,
    tokenAddress: string,
    amount: string,
  ): Promise<{ needsApproval: boolean; currentAllowance: string }> {
    if (tokenAddress.toLowerCase() === NATIVE_MON_ADDRESS) {
      return {
        needsApproval: false,
        currentAllowance: ethers.constants.MaxUint256.toString(),
      };
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.provider,
      );
      const allowance = await tokenContract.allowance(
        walletAddress,
        config.kuru.flowEntrypoint,
      );
      const amountBN = ethers.BigNumber.from(amount);

      return {
        needsApproval: allowance.lt(amountBN),
        currentAllowance: allowance.toString(),
      };
    } catch (error) {
      console.error("[TokenService] Error checking allowance:", error);
      return { needsApproval: true, currentAllowance: "0" };
    }
  }

  async getApprovalTransaction(
    tokenAddress: string,
    amount: string = ethers.constants.MaxUint256.toString(),
  ): Promise<{ to: string; data: string; value: string }> {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ERC20_ABI,
      this.provider,
    );
    const tx = await tokenContract.populateTransaction.approve(
      config.kuru.flowEntrypoint,
      amount,
    );

    return {
      to: tokenAddress,
      data: tx.data || "0x",
      value: "0",
    };
  }

  async updateTokenPrice(tokenAddress: string): Promise<number | null> {
    const cached = this.priceCache.get(tokenAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.price;
    }

    try {
      const token = await this.getTokenByAddress(tokenAddress);
      if (!token) return null;

      const tokenId = await this.getCoingeckoTokenId(token.symbol);
      if (!tokenId) return null;

      const response = await fetch(
        `${this.coingeckoBaseUrl}/simple/price?ids=${tokenId}&vs_currencies=usd`,
      );

      if (!response.ok) return null;

      const data = (await response.json()) as Record<string, { usd?: number }>;
      const price = data[tokenId]?.usd;

      if (price) {
        this.priceCache.set(tokenAddress, { price, timestamp: Date.now() });

        await prisma.token.update({
          where: { address: tokenAddress },
          data: { priceUsd: price, priceUpdatedAt: new Date() },
        });

        return price;
      }

      return null;
    } catch (error) {
      console.error(
        `[TokenService] Error updating price for ${tokenAddress}:`,
        error,
      );
      return null;
    }
  }

  private async getCoingeckoTokenId(symbol: string): Promise<string | null> {
    const symbolMap: Record<string, string> = {
      mon: "monad",
      usdc: "usd-coin",
      usdt: "tether",
      ausd: "agora-dollar",
    };

    return symbolMap[symbol.toLowerCase()] || null;
  }

  async getTotalValueUsd(walletAddress: string): Promise<number> {
    const balances = await this.getBalances(walletAddress);
    return balances.reduce((total, b) => total + (b.valueUsd || 0), 0);
  }
}

export const tokenService = new TokenService();
