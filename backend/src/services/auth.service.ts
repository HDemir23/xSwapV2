import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../prisma";
import { generateSessionToken } from "../utils/helpers";

const AUTH_MESSAGE_PREFIX = "xSwap Authentication";
const AUTH_MESSAGE_VERSION = "1";

export interface AuthPayload {
  userId: string;
  walletAddress: string;
}

export class AuthService {
  generateAuthMessage(address: string, nonce: string): string {
    return `${AUTH_MESSAGE_PREFIX}
Version: ${AUTH_MESSAGE_VERSION}
Address: ${address}
Nonce: ${nonce}
Timestamp: ${Date.now()}
 
Sign this message to authenticate with xSwap.
This signature will not trigger any blockchain transaction.
Only sign this message if you trust the application.`;
  }

  async verifySignature(
    address: string,
    message: string,
    signature: string,
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("[AuthService] Signature verification failed:", error);
      return false;
    }
  }

  async authenticate(
    address: string,
    message: string,
    signature: string,
  ): Promise<{ sessionToken: string; user: any } | null> {
    const isValid = await this.verifySignature(address, message, signature);
    if (!isValid) {
      return null;
    }

    const normalizedAddress = address.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: normalizedAddress },
      });
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    return { sessionToken, user };
  }

  async validateSession(token: string): Promise<AuthPayload | null> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return {
      userId: session.userId,
      walletAddress: session.user.walletAddress,
    };
  }

  async logout(token: string): Promise<void> {
    await prisma.session.deleteMany({ where: { token } });
  }

  async cleanExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }

  generateJwt(payload: AuthPayload): string {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: 86400 });
  }

  verifyJwt(token: string): AuthPayload | null {
    try {
      return jwt.verify(token, config.jwt.secret) as AuthPayload;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
