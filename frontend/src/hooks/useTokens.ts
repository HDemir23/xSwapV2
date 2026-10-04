import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useTokens() {
  return useQuery({
    queryKey: ["tokens"],
    queryFn: () => apiClient.getTokens(),
    staleTime: 5 * 60 * 1000,
  });
}
