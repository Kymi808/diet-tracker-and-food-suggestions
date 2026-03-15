from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models import Meal


def get_daily_summary(db: Session, date: str) -> dict:
    """Aggregate nutrition totals for a given date (YYYY-MM-DD)."""
    meals = db.query(Meal).filter(Meal.date == date).all()

    total_calories = sum(m.calories or 0 for m in meals)
    total_protein = sum(m.protein_g or 0 for m in meals)
    total_carbs = sum(m.carbs_g or 0 for m in meals)
    total_fat = sum(m.fat_g or 0 for m in meals)
    total_fiber = sum(m.fiber_g or 0 for m in meals)

    return {
        "date": date,
        "total_calories": round(total_calories, 1),
        "total_protein_g": round(total_protein, 1),
        "total_carbs_g": round(total_carbs, 1),
        "total_fat_g": round(total_fat, 1),
        "total_fiber_g": round(total_fiber, 1),
        "meal_count": len(meals),
    }


def get_weekly_summary(db: Session, start_date: str) -> dict:
    """Return 7 daily summaries starting from *start_date* and averages."""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    days = []
    for i in range(7):
        day = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        days.append(get_daily_summary(db, day))

    days_with_meals = [d for d in days if d["meal_count"] > 0]
    count = len(days_with_meals) or 1  # avoid division by zero

    return {
        "start_date": start_date,
        "end_date": (start + timedelta(days=6)).strftime("%Y-%m-%d"),
        "days": days,
        "avg_calories": round(sum(d["total_calories"] for d in days_with_meals) / count, 1),
        "avg_protein_g": round(sum(d["total_protein_g"] for d in days_with_meals) / count, 1),
        "avg_carbs_g": round(sum(d["total_carbs_g"] for d in days_with_meals) / count, 1),
        "avg_fat_g": round(sum(d["total_fat_g"] for d in days_with_meals) / count, 1),
    }
