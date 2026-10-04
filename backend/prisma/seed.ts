import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import * as KuruSdk from "@kuru-labs/kuru-sdk";

const prisma = new PrismaClient();

const provider = new ethers.providers.JsonRpcProvider("https://rpc.monad.xyz", {
  chainId: 143,
  name: "monad",
});

const NATIVE_MON = "0x0000000000000000000000000000000000000000";

const KNOWN_MARKETS = [
  "0x131a2e70a5b31a517a74b8c567149bc294470da9", // MON-AUSD
  "0x065C2e70a5b31a517a74b8c567149bc294470da9", // MON-USDC (approximate)
];

async function indexToken(tokenAddress: string): Promise<void> {
  const address = tokenAddress.toLowerCase();

  const existing = await prisma.token.findUnique({ where: { address } });
  if (existing) return;

  if (address === NATIVE_MON) {
    await prisma.token.create({
      data: {
        address,
        symbol: "MON",
        name: "Monad",
        decimals: 18,
        isNative: true,
      },
    });
    console.log("  Indexed native MON token");
    return;
  }

  const tokenContract = new ethers.Contract(
    tokenAddress,
    [
      "function symbol() view returns (string)",
      "function name() view returns (string)",
      "function decimals() view returns (uint8)",
    ],
    provider,
  );

  const [symbol, name, decimals] = await Promise.all([
    tokenContract.symbol(),
    tokenContract.name(),
    tokenContract.decimals(),
  ]);

  await prisma.token.create({
    data: { address, symbol, name, decimals },
  });

  console.log(`  Indexed token: ${symbol}`);
}

async function main() {
  console.log("Seeding markets and tokens from known markets...\n");

  for (const marketAddress of KNOWN_MARKETS) {
    console.log(`Processing market: ${marketAddress}`);

    try {
      const marketParams = await KuruSdk.ParamFetcher.getMarketParams(
        provider,
        marketAddress,
      );

      const baseAsset = marketParams.baseAssetAddress;
      const quoteAsset = marketParams.quoteAssetAddress;

      console.log(`  Base: ${baseAsset}`);
      console.log(`  Quote: ${quoteAsset}`);

      const existingMarket = await prisma.market.findUnique({
        where: { address: marketAddress },
      });

      if (!existingMarket) {
        await prisma.market.create({
          data: {
            address: marketAddress,
            baseAsset: baseAsset.toLowerCase(),
            quoteAsset: quoteAsset.toLowerCase(),
            vaultAddress: ethers.constants.AddressZero,
            tickSize: marketParams.tickSize.toString(),
            sizePrecision: marketParams.sizePrecision.toString(),
            pricePrecision: marketParams.pricePrecision.toString(),
            minSize: marketParams.minSize.toString(),
            maxSize: marketParams.maxSize.toString(),
            takerFeeBps: marketParams.takerFeeBps.toString(),
            makerFeeBps: marketParams.makerFeeBps.toString(),
          },
        });
        console.log("  Market saved to database");
      } else {
        console.log("  Market already exists");
      }

      await indexToken(baseAsset);
      await indexToken(quoteAsset);

      console.log("");
    } catch (error) {
      console.error(`  Error processing market: ${error}`);
    }
  }

  const tokens = await prisma.token.findMany();
  const markets = await prisma.market.findMany();

  console.log(`\nSeeding complete!`);
  console.log(`  Tokens: ${tokens.length}`);
  console.log(`  Markets: ${markets.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
