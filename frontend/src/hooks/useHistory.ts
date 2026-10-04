import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { apiClient } from "@/lib/api";

export function useHistory(limit = 50, offset = 0) {
  const { isConnected } = useAccount();

  return useQuery({
    queryKey: ["history", limit, offset],
    queryFn: () => apiClient.getHistory(limit, offset),
    enabled: isConnected && apiClient.isAuthenticated(),
    staleTime: 60 * 1000,
  });
}
