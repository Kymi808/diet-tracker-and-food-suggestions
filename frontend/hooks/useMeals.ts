import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMeals, fetchMeal, createMeal, deleteMeal } from "../services/api";
import { Meal } from "../types";

export function useMeals(date: string) {
  return useQuery<Meal[]>({
    queryKey: ["meals", date],
    queryFn: () => fetchMeals(date),
  });
}

export function useMeal(id: number) {
  return useQuery<Meal>({
    queryKey: ["meal", id],
    queryFn: () => fetchMeal(id),
    enabled: id > 0,
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createMeal(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["dailySummary"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });
}
