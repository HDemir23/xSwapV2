import { useQuery } from "@tanstack/react-query";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { apiClient } from "@/lib/api";
import type { Token, Balance } from "@/types";
import { NATIVE_MON_ADDRESS } from "@/types";
import { formatTokenAmount } from "@shared/utils/format";
import { useMemo } from "react";

const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export function useNativeBalance() {
  const { address, isConnected } = useAccount();

  return useBalance({
    address: address,
    query: {
      enabled: isConnected && !!address,
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    },
  });
}

export function useTokenBalances(tokens: Token[]) {
  const { address, isConnected } = useAccount();

  const erc20Tokens = useMemo(
    () => tokens.filter((t) => t.address !== NATIVE_MON_ADDRESS),
    [tokens]
  );

  const contracts = useMemo(
    () =>
      erc20Tokens.map((token) => ({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf" as const,
        args: address ? [address] : undefined,
      })),
    [erc20Tokens, address]
  );

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: isConnected && !!address && erc20Tokens.length > 0,
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    },
  });

  return {
    data,
    isLoading,
    refetch,
    erc20Tokens,
  };
}

export function useWalletBalances(tokens: Token[]): {
  balances: Balance[];
  isLoading: boolean;
  refetch: () => void;
} {
  const nativeBalance = useNativeBalance();
  const { data: erc20Data, isLoading: erc20Loading, refetch: refetchErc20, erc20Tokens } = useTokenBalances(tokens);

  const isLoading = nativeBalance.isLoading || erc20Loading;

  const balances = useMemo(() => {
    const result: Balance[] = [];

    const nativeToken = tokens.find((t) => t.address === NATIVE_MON_ADDRESS);
    if (nativeToken && nativeBalance.data) {
      const formatted = parseFloat(nativeBalance.data.formatted || "0").toFixed(6);
      result.push({
        token: nativeToken,
        balance: nativeBalance.data.value.toString(),
        balanceFormatted: formatted,
      });
    }

    if (erc20Data && erc20Tokens) {
      erc20Tokens.forEach((token, index) => {
        const res = erc20Data[index];
        if (res && res.status === "success" && res.result !== undefined) {
          const balanceBigInt = res.result as bigint;
          const formatted = formatTokenAmount(balanceBigInt, token.decimals);
          result.push({
            token,
            balance: balanceBigInt.toString(),
            balanceFormatted: formatted,
          });
        }
      });
    }

    return result;
  }, [tokens, nativeBalance.data, erc20Data, erc20Tokens]);

  const refetch = useMemo(
    () => () => {
      nativeBalance.refetch();
      refetchErc20();
    },
    [nativeBalance, refetchErc20]
  );

  return {
    balances,
    isLoading,
    refetch,
  };
}

export function useBalances() {
  const { isConnected } = useAccount();

  return useQuery({
    queryKey: ["balances"],
    queryFn: () => apiClient.getBalances(),
    enabled: isConnected && apiClient.isAuthenticated(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
