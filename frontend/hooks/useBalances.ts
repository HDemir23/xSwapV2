import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { apiClient } from "@/lib/api";

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
