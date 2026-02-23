import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../prisma";
import { config } from "../config";

const router = Router();

router.get(
  "/",
  authMiddleware,
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

      const formattedTxs = transactions.map((tx: any) => ({
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
        confirmedAt: tx.confirmedAt?.toISOString() || null,
        explorerUrl: `${config.monad.blockExplorer}/tx/${tx.txHash}`,
      }));

      res.json({
        transactions: formattedTxs,
        total,
        limit,
        offset,
      });
    } catch (error) {
      console.error("[HistoryRoute] Error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  },
);

router.get(
  "/:txHash",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { txHash } = req.params;

      const tx = await prisma.transaction.findFirst({
        where: {
          txHash: String(txHash),
          userId: req.user!.userId,
        },
      });

      if (!tx) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.json({
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
        confirmedAt: tx.confirmedAt?.toISOString() || null,
        explorerUrl: `${config.monad.blockExplorer}/tx/${tx.txHash}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transaction" });
    }
  },
);

export default router;
