from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DailyGoal
from app.schemas import SuggestionsResponse
from app.services import nutrition_service, suggestion_service

router = APIRouter()


@router.get("/suggestions/", response_model=SuggestionsResponse)
def get_suggestions(
    target_date: str = Query(None, description="Date in YYYY-MM-DD format; defaults to today"),
    db: Session = Depends(get_db),
):
    if not target_date:
        target_date = date.today().isoformat()

    # Get current intake
    summary = nutrition_service.get_daily_summary(db, target_date)

    # Get goals (or create defaults)
    goal = db.query(DailyGoal).first()
    if not goal:
        goal = DailyGoal()
        db.add(goal)
        db.commit()
        db.refresh(goal)

    goals_dict = {
        "calorie_goal": goal.calorie_goal,
        "protein_goal": goal.protein_goal,
        "carbs_goal": goal.carbs_goal,
        "fat_goal": goal.fat_goal,
    }

    suggestions = suggestion_service.get_suggestions(summary, goals_dict)

    return SuggestionsResponse(
        remaining_calories=max(0, goal.calorie_goal - summary["total_calories"]),
        remaining_protein=max(0, goal.protein_goal - summary["total_protein_g"]),
        remaining_carbs=max(0, goal.carbs_goal - summary["total_carbs_g"]),
        remaining_fat=max(0, goal.fat_goal - summary["total_fat_g"]),
        suggestions=suggestions,
    )
