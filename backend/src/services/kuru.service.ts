import { ethers } from "ethers";
import { config, NATIVE_MON_ADDRESS } from "../config";
import { prisma } from "../prisma";
import { kuruApiService, KuruBuildResponse } from "./kuruApi.service";

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
  unsignedTx?: KuruBuildResponse;
  quoteId: string;
  expiresAt: number;
}

export class KuruService {
  private provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.monad.rpcUrl, {
      name: "monad",
      chainId: 143,
    });
  }

  async getQuote(params: QuoteRequest): Promise<QuoteResponse> {
    const { userAddress, tokenIn, tokenOut, amount, slippage } = params;

    // Validate tokens exist in database
    const tokenInInfo = await prisma.token.findFirst({
      where: { address: tokenIn.toLowerCase() },
    });
    const tokenOutInfo = await prisma.token.findFirst({
      where: { address: tokenOut.toLowerCase() },
    });

    if (!tokenInInfo || !tokenOutInfo) {
      throw new Error("Token not found");
    }

    // Validate amount
    const amountBN = ethers.BigNumber.from(amount);
    if (amountBN.isZero()) {
      throw new Error("Amount must be greater than 0");
    }

    // Call real Kuru API
    const kuruQuote = await kuruApiService.getQuote({
      userAddress,
      tokenIn,
      tokenOut,
      amount,
      slippageTolerance: Math.round(slippage * 100), // Convert 0.5% to 50 bps
      autoSlippage: false,
    });

    if (kuruQuote.status !== "success") {
      throw new Error(kuruQuote.error || "Failed to get quote from Kuru");
    }

    // Calculate amounts from real response
    const outputAmountWei = ethers.BigNumber.from(kuruQuote.output);
    const platformFee = outputAmountWei.mul(config.fee.bps).div(10000);
    const userReceives = outputAmountWei; // Kuru already handles fee deduction

    // Generate quote ID and save to database
    const quoteId = ethers.utils.hexlify(ethers.utils.randomBytes(16)).slice(2);
    const expiresAt = Date.now() + 30000;

    await prisma.savedQuote.create({
      data: {
        id: quoteId,
        userAddress,
        tokenIn: tokenIn.toLowerCase(),
        tokenOut: tokenOut.toLowerCase(),
        amountIn: amount,
        amountOut: outputAmountWei.toString(),
        platformFee: platformFee.toString(),
        slippage,
        route: kuruQuote.path ? JSON.stringify(kuruQuote.path) : "",
        buildResponse: kuruQuote.transaction
          ? JSON.stringify(kuruQuote.transaction)
          : "",
        expiresAt: new Date(expiresAt),
      },
    });

    // Format response
    const inputAmount = parseFloat(
      ethers.utils.formatUnits(amount, tokenInInfo.decimals),
    );
    const outputAmount = parseFloat(
      ethers.utils.formatUnits(outputAmountWei, tokenOutInfo.decimals),
    );
    const price =
      inputAmount > 0 ? (outputAmount / inputAmount).toFixed(6) : "0";

    // Normalize transaction data - API returns 'calldata' but frontend expects 'data'
    const normalizedTx = kuruQuote.transaction
      ? {
          to: kuruQuote.transaction.to,
          data:
            kuruQuote.transaction.calldata || kuruQuote.transaction.data || "",
          value: kuruQuote.transaction.value || "0",
          gasLimit: kuruQuote.transaction.gasLimit,
        }
      : undefined;

    return {
      outputAmount: outputAmountWei.toString(),
      outputAmountFormatted: ethers.utils.formatUnits(
        outputAmountWei,
        tokenOutInfo.decimals,
      ),
      route: `Kuru DEX (${tokenInInfo.symbol}/${tokenOutInfo.symbol})`,
      priceImpact: "0.1",
      platformFee: platformFee.toString(),
      platformFeeFormatted: ethers.utils.formatUnits(
        platformFee,
        tokenOutInfo.decimals,
      ),
      userReceives: userReceives.toString(),
      userReceivesFormatted: ethers.utils.formatUnits(
        userReceives,
        tokenOutInfo.decimals,
      ),
      price: `1 ${tokenInInfo.symbol} = ${price} ${tokenOutInfo.symbol}`,
      unsignedTx: normalizedTx, // CRITICAL: Return normalized unsigned TX!
      quoteId,
      expiresAt,
    };
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
