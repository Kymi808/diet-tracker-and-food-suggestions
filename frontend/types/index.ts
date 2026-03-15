// --------------- Food Item ---------------

export interface FoodItem {
  name: string;
  estimated_calories: number;
  estimated_protein_g?: number;
  estimated_carbs_g?: number;
  estimated_fat_g?: number;
}

// --------------- Meal ---------------

export interface Meal {
  id: number;
  meal_type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  image_path: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  food_items: FoodItem[] | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MealCreate {
  meal_type: string;
  date: string;
  time: string;
  notes?: string;
}

export interface MealUpdate {
  meal_type?: string;
  date?: string;
  time?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  food_items?: FoodItem[];
  notes?: string;
}

// --------------- Summaries ---------------

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  meal_count: number;
}

export interface WeeklySummary {
  start_date: string;
  end_date: string;
  days: DailySummary[];
  avg_calories: number;
  avg_protein_g: number;
  avg_carbs_g: number;
  avg_fat_g: number;
}

// --------------- Suggestions ---------------

export interface FoodSuggestion {
  name: string;
  description: string;
  estimated_calories: number;
  estimated_protein: number;
  reason: string;
}

export interface SuggestionsResponse {
  remaining_calories: number;
  remaining_protein: number;
  remaining_carbs: number;
  remaining_fat: number;
  suggestions: FoodSuggestion[];
}

// --------------- Goals ---------------

export interface DailyGoal {
  id: number;
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
}

export interface DailyGoalUpdate {
  calorie_goal?: number;
  protein_goal?: number;
  carbs_goal?: number;
  fat_goal?: number;
}
