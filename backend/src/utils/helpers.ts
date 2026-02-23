import { ethers } from "ethers";

export function isValidAddress(address: string): boolean {
  return ethers.utils.isAddress(address);
}

export function normalizeAddress(address: string): string {
  return ethers.utils.getAddress(address);
}

export function hashPassword(password: string): string {
  return ethers.utils.id(password);
}

export function generateApiKey(): string {
  const randomBytes = ethers.utils.randomBytes(32);
  return `xsk_${ethers.utils.hexlify(randomBytes).slice(2)}`;
}

export function generateApiSecret(): string {
  const randomBytes = ethers.utils.randomBytes(32);
  return `xss_${ethers.utils.hexlify(randomBytes).slice(2)}`;
}

export function generateSessionToken(): string {
  const randomBytes = ethers.utils.randomBytes(32);
  return ethers.utils.hexlify(randomBytes).slice(2);
}

export function formatUnits(amount: string, decimals: number): string {
  try {
    return ethers.utils.formatUnits(amount, decimals);
  } catch {
    return "0";
  }
}

export function parseUnits(amount: string, decimals: number): ethers.BigNumber {
  try {
    return ethers.utils.parseUnits(amount, decimals);
  } catch {
    return ethers.BigNumber.from(0);
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, decimals = 4): string {
  if (num === 0) return "0";
  if (num < 0.0001) return num.toExponential(2);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}
