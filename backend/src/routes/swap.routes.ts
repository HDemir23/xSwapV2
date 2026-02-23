import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { kuruService } from "../services/kuru.service";
import { tokenService } from "../services/token.service";
import { apiLimiter } from "../middleware/errorHandler";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const tokens = await tokenService.getTokenList();
    res.json({ tokens });
  } catch (error) {
    console.error("[TokensRoute] Error:", error);
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

router.get("/:address", async (req: Request, res: Response): Promise<void> => {
  try {
    const address = String(req.params.address);
    const token = await tokenService.getTokenByAddress(address);

    if (!token) {
      res.status(404).json({ error: "Token not found" });
      return;
    }

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

router.post(
  "/quote",
  apiLimiter,
  authMiddleware,
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
      console.error("[SwapRoute] Quote error:", error);
      res.status(500).json({ error: error.message || "Failed to get quote" });
    }
  },
);

router.post(
  "/execute",
  apiLimiter,
  authMiddleware,
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
      console.error("[SwapRoute] Execute error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to execute swap" });
    }
  },
);

router.get(
  "/allowance/:token",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const { amount } = req.query;

      if (!amount) {
        res.status(400).json({ error: "amount query parameter is required" });
        return;
      }

      const allowance = await tokenService.checkAllowance(
        req.user!.walletAddress,
        String(token),
        String(amount),
      );

      res.json(allowance);
    } catch (error) {
      res.status(500).json({ error: "Failed to check allowance" });
    }
  },
);

router.post(
  "/approve/:token",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const { amount } = req.body;

      const tx = await tokenService.getApprovalTransaction(
        String(token),
        amount ? String(amount) : undefined,
      );

      res.json({ transaction: tx });
    } catch (error) {
      res.status(500).json({ error: "Failed to create approval transaction" });
    }
  },
);

export default router;
