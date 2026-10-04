import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL || "",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-me",
    expiresIn: "24h" as string,
  },

  monad: {
    rpcUrl: process.env.MONAD_RPC_URL || "https://rpc.monad.xyz",
    chainId: parseInt(process.env.MONAD_CHAIN_ID || "143", 10),
    blockExplorer: "https://monadvision.com",
  },

  kuru: {
    apiUrl: process.env.KURU_API_URL || "https://ws.kuru.io",
    routerAddress:
      process.env.KURU_ROUTER_ADDRESS ||
      "0xd651346d7c789536ebf06dc72aE3C8502cd695CC",
    flowEntrypoint:
      process.env.KURU_FLOW_ENTRYPOINT ||
      "0xb3e6778480b2E488385E8205eA05E20060B813cb",
    marginAccount:
      process.env.KURU_MARGIN_ACCOUNT ||
      "0x2A68ba1833cDf93fa9Da1EEbd7F46242aD8E90c5",
    routerDeploymentBlock: parseInt(
      process.env.KURU_ROUTER_DEPLOYMENT_BLOCK || "0",
      10,
    ),
  },

  fee: {
    walletAddress: process.env.FEE_WALLET_ADDRESS || "",
    bps: parseInt(process.env.PLATFORM_FEE_BPS || "50", 10),
  },

  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  },

  rateLimit: {
    rpm: parseInt(process.env.RATE_LIMIT_RPM || "60", 10),
    botRpm: parseInt(process.env.BOT_RATE_LIMIT_RPM || "100", 10),
  },
};

// Startup validation for fee configuration
if (!config.fee.walletAddress) {
  console.warn(
    "[Config] WARNING: FEE_WALLET_ADDRESS not set - referral fees will not be collected!",
  );
} else {
  console.log(`[Config] Fee wallet configured: ${config.fee.walletAddress}`);
}

if (config.fee.bps < 0 || config.fee.bps > 10000) {
  console.warn(
    "[Config] WARNING: PLATFORM_FEE_BPS should be between 0 and 10000 (0-100%)",
  );
}

export { NATIVE_MON_ADDRESS, WMON_ADDRESS } from "@shared/constants";
