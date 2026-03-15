import os

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.models import Meal
from app.schemas import MealResponse
from app.services import vision_service

router = APIRouter()


@router.post("/analysis/reanalyze/{meal_id}", response_model=MealResponse)
def reanalyze_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    if not meal.image_path:
        raise HTTPException(status_code=400, detail="Meal has no image to analyze")

    abs_path = os.path.join(UPLOAD_DIR, meal.image_path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="Image file not found on disk")

    analysis = vision_service.analyze_meal_image(abs_path)
    meal.calories = analysis.get("calories")
    meal.protein_g = analysis.get("protein_g")
    meal.carbs_g = analysis.get("carbs_g")
    meal.fat_g = analysis.get("fat_g")
    meal.fiber_g = analysis.get("fiber_g")
    meal.set_food_items(analysis.get("food_items"))

    db.commit()
    db.refresh(meal)

    return {
        "id": meal.id,
        "meal_type": meal.meal_type,
        "date": meal.date,
        "time": meal.time,
        "image_path": meal.image_path,
        "calories": meal.calories,
        "protein_g": meal.protein_g,
        "carbs_g": meal.carbs_g,
        "fat_g": meal.fat_g,
        "fiber_g": meal.fiber_g,
        "food_items": meal.get_food_items(),
        "notes": meal.notes,
        "created_at": meal.created_at,
        "updated_at": meal.updated_at,
    }
