import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { kuruService } from "../services/kuru.service";
import { tokenService } from "../services/token.service";
import { apiLimiter } from "../middleware/errorHandler";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  addressParamSchema,
  tokenParamSchema,
  quoteRequestSchema,
  executeRequestSchema,
  paginationSchema,
} from "../validators";

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

router.get(
  "/:address",
  validateParams(addressParamSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const address = req.params.address as string;
      const token = await tokenService.getTokenByAddress(address);

      if (!token) {
        res.status(404).json({ error: "Token not found" });
        return;
      }

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token" });
    }
  },
);

router.post(
  "/quote",
  apiLimiter,
  validateBody(quoteRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { tokenIn, tokenOut, amount, slippage } = req.body;

      const userAddress =
        req.user?.walletAddress || "0x0000000000000000000000000000000000000000";

      const quote = await kuruService.getQuote({
        userAddress,
        tokenIn,
        tokenOut,
        amount,
        slippage,
      });

      res.json(quote);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to get quote";
      console.error("[SwapRoute] Quote error:", error);
      res.status(500).json({ error: message });
    }
  },
);

router.post(
  "/execute",
  apiLimiter,
  authMiddleware,
  validateBody(executeRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { signedTx, quoteId } = req.body;

      const result = await kuruService.executeSwap({
        signedTx,
        quoteId,
        userId: req.user!.userId,
      });

      res.json({
        ...result,
        explorerUrl: kuruService.getExplorerUrl(result.txHash),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to execute swap";
      console.error("[SwapRoute] Execute error:", error);
      res.status(500).json({ error: message });
    }
  },
);

router.get(
  "/allowance/:token",
  authMiddleware,
  validateParams(tokenParamSchema),
  validateQuery(paginationSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.params.token as string;
      const { amount } = req.query;

      if (!amount) {
        res.status(400).json({ error: "amount query parameter is required" });
        return;
      }

      const allowance = await tokenService.checkAllowance(
        req.user!.walletAddress,
        token,
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
  validateParams(tokenParamSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.params.token as string;
      const { amount } = req.body;

      const tx = await tokenService.getApprovalTransaction(
        token,
        amount ? String(amount) : undefined,
      );

      res.json({ transaction: tx });
    } catch (error) {
      res.status(500).json({ error: "Failed to create approval transaction" });
    }
  },
);

export default router;
