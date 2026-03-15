import axios from "axios";
import {
  Meal,
  MealUpdate,
  DailySummary,
  WeeklySummary,
  SuggestionsResponse,
  DailyGoal,
  DailyGoalUpdate,
} from "../types";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// --------------- Meals ---------------

export async function fetchMeals(date: string): Promise<Meal[]> {
  const { data } = await client.get<Meal[]>("/meals", {
    params: { date },
  });
  return data;
}

export async function fetchMeal(id: number): Promise<Meal> {
  const { data } = await client.get<Meal>(`/meals/${id}`);
  return data;
}

export async function createMeal(formData: FormData): Promise<Meal> {
  const { data } = await client.post<Meal>("/meals", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000, // longer timeout for image upload + analysis
  });
  return data;
}

export async function updateMeal(
  id: number,
  update: MealUpdate
): Promise<Meal> {
  const { data } = await client.patch<Meal>(`/meals/${id}`, update);
  return data;
}

export async function deleteMeal(id: number): Promise<void> {
  await client.delete(`/meals/${id}`);
}

export async function reanalyzeMeal(id: number): Promise<Meal> {
  const { data } = await client.post<Meal>(`/meals/${id}/reanalyze`);
  return data;
}

// --------------- Summaries ---------------

export async function fetchDailySummary(date: string): Promise<DailySummary> {
  const { data } = await client.get<DailySummary>("/summary/daily", {
    params: { date },
  });
  return data;
}

export async function fetchWeeklySummary(
  date: string
): Promise<WeeklySummary> {
  const { data } = await client.get<WeeklySummary>("/summary/weekly", {
    params: { date },
  });
  return data;
}

// --------------- Suggestions ---------------

export async function fetchSuggestions(
  date: string
): Promise<SuggestionsResponse> {
  const { data } = await client.get<SuggestionsResponse>("/suggestions", {
    params: { date },
  });
  return data;
}

// --------------- Goals ---------------

export async function fetchGoals(): Promise<DailyGoal> {
  const { data } = await client.get<DailyGoal>("/goals");
  return data;
}

export async function updateGoals(update: DailyGoalUpdate): Promise<DailyGoal> {
  const { data } = await client.patch<DailyGoal>("/goals", update);
  return data;
}
