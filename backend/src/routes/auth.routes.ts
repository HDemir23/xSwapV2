import { Router, Request, Response } from "express";
import { authService } from "../services/auth.service";
import { strictLimiter } from "../middleware/errorHandler";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/message", strictLimiter, (req: Request, res: Response): void => {
  const { address } = req.body;

  if (!address) {
    res.status(400).json({ error: "Address is required" });
    return;
  }

  const nonce = uuidv4();
  const message = authService.generateAuthMessage(address, nonce);

  res.json({ message, nonce });
});

router.post(
  "/connect",
  strictLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { address, message, signature } = req.body;

      if (!address || !message || !signature) {
        res
          .status(400)
          .json({ error: "Address, message, and signature are required" });
        return;
      }

      const result = await authService.authenticate(
        address,
        message,
        signature,
      );

      if (!result) {
        res.status(401).json({ error: "Invalid signature" });
        return;
      }

      res.json({
        sessionToken: result.sessionToken,
        expiresIn: 86400,
        user: {
          id: result.user.id,
          address: result.user.walletAddress,
        },
      });
    } catch (error) {
      console.error("[AuthRoute] Connect error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  },
);

router.post(
  "/disconnect",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        await authService.logout(token);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  },
);

export default router;
