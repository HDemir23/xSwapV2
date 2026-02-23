import { Request, Response, NextFunction } from "express";
import { authService, AuthPayload } from "../services/auth.service";
import { prisma } from "../prisma";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      apiKey?: any;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.substring(7);
    const payload = await authService.validateSession(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await authService.validateSession(token);
      if (payload) {
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    next();
  }
}

export async function botAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    const apiSecret = req.headers["x-api-secret"] as string;

    if (!apiKey || !apiSecret) {
      res.status(401).json({ error: "Missing API credentials" });
      return;
    }

    const keyRecord = await prisma.apiKey.findUnique({
      where: { apiKey },
      include: { user: true },
    });

    if (!keyRecord || !keyRecord.isActive) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    if (keyRecord.apiSecret !== apiSecret) {
      res.status(401).json({ error: "Invalid API secret" });
      return;
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      res.status(401).json({ error: "API key has expired" });
      return;
    }

    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    req.apiKey = keyRecord;
    req.user = {
      userId: keyRecord.userId,
      walletAddress: keyRecord.walletAddress,
    };

    next();
  } catch (error) {
    console.error("[BotAuthMiddleware] Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
