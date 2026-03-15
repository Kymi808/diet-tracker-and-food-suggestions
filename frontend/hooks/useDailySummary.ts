import { useQuery } from "@tanstack/react-query";
import { fetchDailySummary, fetchGoals } from "../services/api";
import { DailySummary, DailyGoal } from "../types";

export function useDailySummary(date: string) {
  return useQuery<DailySummary>({
    queryKey: ["dailySummary", date],
    queryFn: () => fetchDailySummary(date),
  });
}

export function useGoals() {
  return useQuery<DailyGoal>({
    queryKey: ["goals"],
    queryFn: fetchGoals,
  });
}
