from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


# --------------- Meal ---------------

class MealCreate(BaseModel):
    meal_type: str
    date: str
    time: str
    notes: Optional[str] = None


class MealUpdate(BaseModel):
    meal_type: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    food_items: Optional[list[dict[str, Any]]] = None
    notes: Optional[str] = None


class MealResponse(BaseModel):
    id: int
    meal_type: str
    date: str
    time: str
    image_path: Optional[str] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    food_items: Optional[list[dict[str, Any]]] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# --------------- Summaries ---------------

class DailySummary(BaseModel):
    date: str
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    meal_count: int


class WeeklySummary(BaseModel):
    start_date: str
    end_date: str
    days: list[DailySummary]
    avg_calories: float
    avg_protein_g: float
    avg_carbs_g: float
    avg_fat_g: float


# --------------- Suggestions ---------------

class FoodSuggestion(BaseModel):
    name: str
    description: str
    estimated_calories: float
    estimated_protein: float
    reason: str


class SuggestionsResponse(BaseModel):
    remaining_calories: float
    remaining_protein: float
    remaining_carbs: float
    remaining_fat: float
    suggestions: list[FoodSuggestion]


# --------------- Goals ---------------

class DailyGoalResponse(BaseModel):
    id: int
    calorie_goal: float
    protein_goal: float
    carbs_goal: float
    fat_goal: float

    model_config = {"from_attributes": True}


class DailyGoalUpdate(BaseModel):
    calorie_goal: Optional[float] = None
    protein_goal: Optional[float] = None
    carbs_goal: Optional[float] = None
    fat_goal: Optional[float] = None
