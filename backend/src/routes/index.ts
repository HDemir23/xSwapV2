import { Router } from "express";
import authRoutes from "./auth.routes";
import swapRoutes from "./swap.routes";
import portfolioRoutes from "./portfolio.routes";
import historyRoutes from "./history.routes";
import botRoutes from "./bot.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tokens", swapRoutes);
router.use("/swap", swapRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/history", historyRoutes);
router.use("/bot", botRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
