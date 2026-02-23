import { ethers } from "ethers";
import { config, NATIVE_MON_ADDRESS } from "../config";
import { prisma } from "../prisma";

interface QuoteRequest {
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage: number;
}

interface QuoteResponse {
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

export class KuruService {
  private provider: ethers.providers.JsonRpcProvider;
  private jwtTokens: Map<string, { token: string; expiresAt: number }> =
    new Map();

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.monad.rpcUrl);
  }

  private async getJwtToken(userAddress: string): Promise<string> {
    const cached = this.jwtTokens.get(userAddress);
    if (cached && cached.expiresAt > Date.now() + 60000) {
      return cached.token;
    }

    try {
      const response = await fetch(`${config.kuru.apiUrl}/api/generate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_address: userAddress }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get JWT token: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        token: string;
        expires_at: number;
      };
      this.jwtTokens.set(userAddress, {
        token: data.token,
        expiresAt: data.expires_at * 1000,
      });

      return data.token;
    } catch (error) {
      console.error("[KuruService] Error getting JWT token:", error);
      throw error;
    }
  }

  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    const { userAddress, tokenIn, tokenOut, amount, slippage } = params;

    const jwtToken = await this.getJwtToken(userAddress);

    const requestBody: any = {
      autoSlippage: false,
      userAddress,
      tokenIn:
        tokenIn.toLowerCase() === NATIVE_MON_ADDRESS
          ? NATIVE_MON_ADDRESS
          : tokenIn,
      tokenOut:
        tokenOut.toLowerCase() === NATIVE_MON_ADDRESS
          ? NATIVE_MON_ADDRESS
          : tokenOut,
      amount,
      slippageTolerance: Math.floor(slippage * 100),
    };

    if (config.fee.walletAddress) {
      requestBody.referrerAddress = config.fee.walletAddress;
      requestBody.referrerFeeBps = config.fee.bps;
    }

    const response = await fetch(`${config.kuru.apiUrl}/api/quote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Quote failed: ${error}`);
    }

    const data = (await response.json()) as {
      status: string;
      message?: string;
      output: string;
      priceImpact?: string;
      path?: any;
      buildResponse?: any;
    };

    if (data.status !== "success") {
      throw new Error(data.message || "Quote calculation failed");
    }

    const outputAmount = data.output;
    const platformFee = this.calculateFee(outputAmount);
    const userReceives = ethers.BigNumber.from(outputAmount)
      .sub(platformFee)
      .toString();

    const tokenInInfo = await prisma.token.findFirst({
      where: { address: tokenIn.toLowerCase() },
    });
    const tokenOutInfo = await prisma.token.findFirst({
      where: { address: tokenOut.toLowerCase() },
    });
    const decimals = tokenOutInfo?.decimals || 18;

    const quoteId = ethers.utils.hexlify(ethers.utils.randomBytes(16)).slice(2);
    const expiresAt = Date.now() + 30000;

    const savedQuote = await prisma.savedQuote.create({
      data: {
        id: quoteId,
        userAddress,
        tokenIn: tokenIn.toLowerCase(),
        tokenOut: tokenOut.toLowerCase(),
        amountIn: amount,
        amountOut: outputAmount,
        platformFee: platformFee.toString(),
        slippage,
        route: JSON.stringify(data.path || {}),
        buildResponse: JSON.stringify(data.buildResponse || {}),
        expiresAt: new Date(expiresAt),
      },
    });

    return {
      outputAmount,
      outputAmountFormatted: ethers.utils.formatUnits(outputAmount, decimals),
      route: "Kuru Flow",
      priceImpact: data.priceImpact || "0.00",
      platformFee: platformFee.toString(),
      platformFeeFormatted: ethers.utils.formatUnits(platformFee, decimals),
      userReceives,
      userReceivesFormatted: ethers.utils.formatUnits(userReceives, decimals),
      price: this.formatPrice(amount, outputAmount, tokenInInfo, tokenOutInfo),
      unsignedTx: data.buildResponse,
      quoteId,
      expiresAt,
    };
  }

  private calculateFee(outputAmount: string): ethers.BigNumber {
    const outputBN = ethers.BigNumber.from(outputAmount);
    return outputBN.mul(config.fee.bps).div(10000);
  }

  private formatPrice(
    amountIn: string,
    amountOut: string,
    tokenIn: any,
    tokenOut: any,
  ): string {
    const inDecimals = tokenIn?.decimals || 18;
    const outDecimals = tokenOut?.decimals || 18;
    const inSymbol = tokenIn?.symbol || "TOKEN";
    const outSymbol = tokenOut?.symbol || "TOKEN";

    const inAmount = parseFloat(ethers.utils.formatUnits(amountIn, inDecimals));
    const outAmount = parseFloat(
      ethers.utils.formatUnits(amountOut, outDecimals),
    );

    if (inAmount === 0) return `0 ${inSymbol} = 0 ${outSymbol}`;

    const price = outAmount / inAmount;
    const inversePrice = inAmount / outAmount;

    return `1 ${inSymbol} = ${price.toFixed(6)} ${outSymbol}`;
  }

  async executeSwap(params: {
    signedTx: string;
    quoteId: string;
    userId: string;
  }): Promise<{ txHash: string; status: string }> {
    const { signedTx, quoteId, userId } = params;

    const savedQuote = await prisma.savedQuote.findUnique({
      where: { id: quoteId },
    });

    if (!savedQuote) {
      throw new Error("Quote not found or expired");
    }

    if (savedQuote.expiresAt < new Date()) {
      throw new Error("Quote has expired");
    }

    try {
      const tx = await this.provider.sendTransaction(signedTx);
      const txHash = tx.hash;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const tokenIn = await prisma.token.findFirst({
        where: { address: savedQuote.tokenIn },
      });
      const tokenOut = await prisma.token.findFirst({
        where: { address: savedQuote.tokenOut },
      });

      await prisma.transaction.create({
        data: {
          userId,
          txHash,
          type: "swap",
          tokenInAddress: savedQuote.tokenIn,
          tokenInSymbol: tokenIn?.symbol || "UNKNOWN",
          tokenInAmount: savedQuote.amountIn,
          tokenOutAddress: savedQuote.tokenOut,
          tokenOutSymbol: tokenOut?.symbol || "UNKNOWN",
          tokenOutAmount: savedQuote.amountOut,
          feeAmount: savedQuote.platformFee,
          feeToken: tokenOut?.symbol || "UNKNOWN",
          status: "pending",
        },
      });

      this.waitForConfirmation(txHash, userId);

      return { txHash, status: "pending" };
    } catch (error: any) {
      console.error("[KuruService] Error executing swap:", error);
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  private async waitForConfirmation(
    txHash: string,
    userId: string,
  ): Promise<void> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, 1, 60000);

      const status = receipt?.status === 1 ? "confirmed" : "failed";

      await prisma.transaction.updateMany({
        where: { txHash },
        data: {
          status,
          confirmedAt: new Date(),
          blockNumber: receipt?.blockNumber
            ? BigInt(receipt.blockNumber)
            : null,
        },
      });

      console.log(`[KuruService] Transaction ${txHash} ${status}`);
    } catch (error) {
      console.error(`[KuruService] Error waiting for confirmation:`, error);
    }
  }

  getExplorerUrl(txHash: string): string {
    return `${config.monad.blockExplorer}/tx/${txHash}`;
  }
}

export const kuruService = new KuruService();
