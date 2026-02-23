import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import routes from "./routes";
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
} from "./middleware/errorHandler";
import { marketDiscoveryService } from "./services/marketDiscovery.service";
import { prisma } from "./prisma";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "xswap-backend",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    console.log("[Server] Starting xSwap Backend...");
    console.log(`[Server] Environment: ${config.nodeEnv}`);
    console.log(`[Server] Port: ${config.port}`);

    await prisma.$connect();
    console.log("[Server] Database connected");

    console.log("[Server] Initializing market discovery...");
    await marketDiscoveryService.initialize();

    app.listen(config.port, () => {
      console.log(`[Server] xSwap Backend running on port ${config.port}`);
      console.log(
        `[Server] Health check: http://localhost:${config.port}/api/health`,
      );
    });
  } catch (error) {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[Server] SIGINT received, shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
