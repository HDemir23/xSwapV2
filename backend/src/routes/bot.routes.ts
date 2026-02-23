import { Router, Request, Response } from "express";
import {
  authMiddleware,
  botAuthMiddleware,
} from "../middleware/auth.middleware";
import { kuruService } from "../services/kuru.service";
import { prisma } from "../prisma";
import { generateApiKey, generateApiSecret } from "../utils/helpers";
import { botLimiter } from "../middleware/errorHandler";
import { config } from "../config";

const router = Router();

router.post(
  "/register",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { botName, walletAddress } = req.body;

      if (!walletAddress) {
        res.status(400).json({ error: "walletAddress is required" });
        return;
      }

      const apiKey = generateApiKey();
      const apiSecret = generateApiSecret();

      const keyRecord = await prisma.apiKey.create({
        data: {
          userId: req.user!.userId,
          apiKey,
          apiSecret,
          botName: botName || `Bot-${Date.now()}`,
          walletAddress: walletAddress.toLowerCase(),
        },
      });

      res.json({
        apiKey: keyRecord.apiKey,
        apiSecret: keyRecord.apiSecret,
        walletAddress: keyRecord.walletAddress,
        botName: keyRecord.botName,
        warning: "Store apiSecret securely. It will not be shown again.",
      });
    } catch (error) {
      console.error("[BotRoute] Register error:", error);
      res.status(500).json({ error: "Failed to register bot" });
    }
  },
);

router.post(
  "/quote",
  botLimiter,
  botAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenIn, tokenOut, amount, slippage = 0.5 } = req.body;

      if (!tokenIn || !tokenOut || !amount) {
        res
          .status(400)
          .json({ error: "tokenIn, tokenOut, and amount are required" });
        return;
      }

      const quote = await kuruService.getQuote({
        userAddress: req.user!.walletAddress,
        tokenIn,
        tokenOut,
        amount,
        slippage,
      });

      res.json(quote);
    } catch (error: any) {
      console.error("[BotRoute] Quote error:", error);
      res.status(500).json({ error: error.message || "Failed to get quote" });
    }
  },
);

router.post(
  "/execute",
  botLimiter,
  botAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { signedTx, quoteId } = req.body;

      if (!signedTx || !quoteId) {
        res.status(400).json({ error: "signedTx and quoteId are required" });
        return;
      }

      const result = await kuruService.executeSwap({
        signedTx,
        quoteId,
        userId: req.user!.userId,
      });

      res.json({
        ...result,
        explorerUrl: kuruService.getExplorerUrl(result.txHash),
      });
    } catch (error: any) {
      console.error("[BotRoute] Execute error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to execute swap" });
    }
  },
);

router.get(
  "/history",
  botAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId: req.user!.userId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.transaction.count({
          where: { userId: req.user!.userId },
        }),
      ]);

      const formattedTxs = transactions.map((tx) => ({
        id: tx.id,
        txHash: tx.txHash,
        type: tx.type,
        tokenIn: {
          symbol: tx.tokenInSymbol,
          address: tx.tokenInAddress,
          amount: tx.tokenInAmount,
        },
        tokenOut: {
          symbol: tx.tokenOutSymbol,
          address: tx.tokenOutAddress,
          amount: tx.tokenOutAmount,
        },
        fee: {
          amount: tx.feeAmount,
          token: tx.feeToken,
        },
        status: tx.status,
        createdAt: tx.createdAt.toISOString(),
        explorerUrl: `${config.monad.blockExplorer}/tx/${tx.txHash}`,
      }));

      res.json({
        transactions: formattedTxs,
        total,
        limit,
        offset,
      });
    } catch (error) {
      console.error("[BotRoute] History error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  },
);

router.post(
  "/regenerate-key",
  botAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const oldKeyId = req.apiKey!.id;

      const newApiKey = generateApiKey();
      const newApiSecret = generateApiSecret();

      await prisma.apiKey.update({
        where: { id: oldKeyId },
        data: { isActive: false },
      });

      const newKeyRecord = await prisma.apiKey.create({
        data: {
          userId: req.user!.userId,
          apiKey: newApiKey,
          apiSecret: newApiSecret,
          botName: req.apiKey!.botName,
          walletAddress: req.apiKey!.walletAddress,
        },
      });

      res.json({
        apiKey: newKeyRecord.apiKey,
        apiSecret: newKeyRecord.apiSecret,
        walletAddress: newKeyRecord.walletAddress,
        warning: "Store apiSecret securely. It will not be shown again.",
      });
    } catch (error) {
      console.error("[BotRoute] Regenerate error:", error);
      res.status(500).json({ error: "Failed to regenerate API key" });
    }
  },
);

export default router;
