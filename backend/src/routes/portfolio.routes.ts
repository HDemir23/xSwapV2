import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { tokenService } from "../services/token.service";

const router = Router();

router.get(
  "/balances",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const balances = await tokenService.getBalances(req.user!.walletAddress);
      const totalValueUsd = balances.reduce(
        (sum, b) => sum + (b.valueUsd || 0),
        0,
      );

      res.json({
        balances,
        totalValueUsd,
      });
    } catch (error) {
      console.error("[PortfolioRoute] Error:", error);
      res.status(500).json({ error: "Failed to fetch balances" });
    }
  },
);

router.get(
  "/balance/:token",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const tokenAddress = String(token);
      const balance = await tokenService.getTokenBalance(
        req.user!.walletAddress,
        tokenAddress,
      );
      const tokenInfo = await tokenService.getTokenByAddress(tokenAddress);

      if (!tokenInfo) {
        res.status(404).json({ error: "Token not found" });
        return;
      }

      const balanceFormatted =
        parseFloat(balance) / Math.pow(10, tokenInfo.decimals);

      res.json({
        token: tokenInfo,
        balance,
        balanceFormatted,
        valueUsd: tokenInfo.priceUsd
          ? balanceFormatted * tokenInfo.priceUsd
          : null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  },
);

export default router;
