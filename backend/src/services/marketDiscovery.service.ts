import { ethers } from "ethers";
import * as KuruSdk from "@kuru-labs/kuru-sdk";
import { config, NATIVE_MON_ADDRESS } from "../config";
import { prisma } from "../prisma";

const ROUTER_ABI = [
  "event MarketRegistered(address indexed baseAsset, address indexed quoteAsset, address market, address vaultAddress, uint32 pricePrecision, uint96 sizePrecision, uint32 tickSize, uint96 minSize, uint96 maxSize, uint256 takerFeeBps, uint256 makerFeeBps, uint96 kuruAmmSpread)",
];

export class MarketDiscoveryService {
  private provider: ethers.providers.JsonRpcProvider;
  private isIndexing: boolean = false;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.monad.rpcUrl, {
      name: "monad",
      chainId: 143,
    });
  }

  async initialize(): Promise<void> {
    console.log("[MarketDiscovery] Initializing market discovery service...");
    try {
      await this.indexMarkets();
      this.startEventListening();
    } catch (error) {
      console.error("[MarketDiscovery] Failed to initialize:", error);
    }
  }

  async indexMarkets(): Promise<void> {
    if (this.isIndexing) {
      console.log("[MarketDiscovery] Already indexing, skipping...");
      return;
    }

    this.isIndexing = true;

    try {
      const routerContract = new ethers.Contract(
        config.kuru.routerAddress,
        ROUTER_ABI,
        this.provider,
      );

      const currentBlock = await this.provider.getBlockNumber();

      let marketIndex = await prisma.marketIndex.findFirst();

      if (!marketIndex) {
        marketIndex = await prisma.marketIndex.create({
          data: { lastIndexedBlock: BigInt(config.kuru.routerDeploymentBlock) },
        });
      }

      const fromBlock =
        Number(marketIndex.lastIndexedBlock) ||
        config.kuru.routerDeploymentBlock;
      const toBlock = currentBlock;

      if (fromBlock >= toBlock) {
        console.log("[MarketDiscovery] Already up to date");
        return;
      }

      console.log(
        `[MarketDiscovery] Indexing from block ${fromBlock} to ${toBlock}`,
      );

      const chunkSize = 100;
      const parallelChunks = 50;

      for (
        let batchStart = fromBlock;
        batchStart < toBlock;
        batchStart += chunkSize * parallelChunks
      ) {
        const promises: Promise<ethers.Event[]>[] = [];

        for (let i = 0; i < parallelChunks; i++) {
          const start = batchStart + i * chunkSize;
          const end = Math.min(start + chunkSize - 1, toBlock);

          if (start <= toBlock) {
            promises.push(
              routerContract
                .queryFilter(
                  routerContract.filters.MarketRegistered(),
                  start,
                  end,
                )
                .catch(() => []),
            );
          }
        }

        const results = await Promise.all(promises);

        for (const events of results) {
          for (const event of events) {
            await this.processMarketEvent(event as ethers.Event);
          }
        }

        const processedTo = Math.min(
          batchStart + chunkSize * parallelChunks,
          toBlock,
        );

        await prisma.marketIndex.update({
          where: { id: marketIndex.id },
          data: { lastIndexedBlock: BigInt(processedTo) },
        });

        if (batchStart % 100000 === 0) {
          console.log(`[MarketDiscovery] Processed up to block ${processedTo}`);
        }
      }

      console.log("[MarketDiscovery] Market indexing complete");
    } catch (error) {
      console.error("[MarketDiscovery] Error during market indexing:", error);
    } finally {
      this.isIndexing = false;
    }
  }

  private async processMarketEvent(event: ethers.Event): Promise<void> {
    try {
      const { baseAsset, quoteAsset, market, vaultAddress } = event.args as any;

      const existingMarket = await prisma.market.findUnique({
        where: { address: market },
      });

      if (existingMarket) {
        return;
      }

      console.log(`[MarketDiscovery] Processing new market: ${market}`);

      const marketParams = await KuruSdk.ParamFetcher.getMarketParams(
        this.provider,
        market,
      );

      await prisma.market.create({
        data: {
          address: market,
          baseAsset: baseAsset.toLowerCase(),
          quoteAsset: quoteAsset.toLowerCase(),
          vaultAddress: vaultAddress.toLowerCase(),
          tickSize: marketParams.tickSize.toString(),
          sizePrecision: marketParams.sizePrecision.toString(),
          pricePrecision: marketParams.pricePrecision.toString(),
          minSize: marketParams.minSize.toString(),
          maxSize: marketParams.maxSize.toString(),
          takerFeeBps: marketParams.takerFeeBps.toString(),
          makerFeeBps: marketParams.makerFeeBps.toString(),
        },
      });

      await this.indexToken(baseAsset);
      await this.indexToken(quoteAsset);

      console.log(`[MarketDiscovery] Indexed market: ${market}`);
    } catch (error) {
      console.error("[MarketDiscovery] Error processing market event:", error);
    }
  }

  private async indexToken(tokenAddress: string): Promise<void> {
    try {
      const address = tokenAddress.toLowerCase();

      const existing = await prisma.token.findUnique({ where: { address } });
      if (existing) return;

      if (address === NATIVE_MON_ADDRESS) {
        await prisma.token.create({
          data: {
            address,
            symbol: "MON",
            name: "Monad",
            decimals: 18,
            isNative: true,
          },
        });
        console.log("[MarketDiscovery] Indexed native MON token");
        return;
      }

      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          "function symbol() view returns (string)",
          "function name() view returns (string)",
          "function decimals() view returns (uint8)",
        ],
        this.provider,
      );

      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals(),
      ]);

      await prisma.token.create({
        data: {
          address,
          symbol,
          name,
          decimals,
        },
      });

      console.log(`[MarketDiscovery] Indexed token: ${symbol} (${address})`);
    } catch (error) {
      console.error(
        `[MarketDiscovery] Error indexing token ${tokenAddress}:`,
        error,
      );
    }
  }

  private startEventListening(): void {
    console.log("[MarketDiscovery] Starting event listener...");

    const routerContract = new ethers.Contract(
      config.kuru.routerAddress,
      ROUTER_ABI,
      this.provider,
    );

    routerContract.on("MarketRegistered", async (...args: any[]) => {
      const event = args[args.length - 1] as ethers.Event;
      console.log("[MarketDiscovery] New market registered event detected");
      await this.processMarketEvent(event);
    });
  }

  async getMarkets(): Promise<any[]> {
    const markets = await prisma.market.findMany({
      where: { isActive: true },
    });
    return markets;
  }

  async getMarketByPair(
    baseAsset: string,
    quoteAsset: string,
  ): Promise<any | null> {
    const market = await prisma.market.findFirst({
      where: {
        baseAsset: baseAsset.toLowerCase(),
        quoteAsset: quoteAsset.toLowerCase(),
        isActive: true,
      },
    });
    return market;
  }
}

export const marketDiscoveryService = new MarketDiscoveryService();
