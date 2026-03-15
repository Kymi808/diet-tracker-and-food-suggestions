import { useQuery } from "@tanstack/react-query";
import { fetchSuggestions } from "../services/api";
import { SuggestionsResponse } from "../types";

export function useSuggestions(date: string) {
  return useQuery<SuggestionsResponse>({
    queryKey: ["suggestions", date],
    queryFn: () => fetchSuggestions(date),
  });
}
