import json
import os
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from PIL import Image
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.database import get_db
from app.models import DailyGoal, Meal
from app.schemas import (
    DailyGoalResponse,
    DailyGoalUpdate,
    DailySummary,
    MealResponse,
    MealUpdate,
    WeeklySummary,
)
from app.services import nutrition_service, vision_service

router = APIRouter()

MAX_IMAGE_SIZE = 1024  # max dimension in pixels


def _meal_to_response(meal: Meal) -> dict:
    """Convert a Meal ORM object to a dict suitable for MealResponse."""
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


def _save_and_resize_image(upload: UploadFile) -> str:
    """Save uploaded image, resize if needed, return relative path."""
    ext = os.path.splitext(upload.filename or "image.jpg")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    # Save raw bytes first
    contents = upload.file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    # Resize with Pillow
    try:
        img = Image.open(filepath)
        if max(img.size) > MAX_IMAGE_SIZE:
            img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.LANCZOS)
            img.save(filepath, quality=85)
    except Exception:
        pass  # keep original if Pillow can't process it

    return filename


# ── CRUD ──────────────────────────────────────────────────────────────────────


@router.post("/meals/", response_model=MealResponse)
async def create_meal(
    meal_type: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    notes: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    image_filename = None
    if image and image.filename:
        image_filename = _save_and_resize_image(image)

    meal = Meal(
        meal_type=meal_type,
        date=date,
        time=time,
        notes=notes,
        image_path=image_filename,
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    # Run vision analysis if an image was uploaded
    if image_filename:
        abs_path = os.path.join(UPLOAD_DIR, image_filename)
        analysis = vision_service.analyze_meal_image(abs_path)
        meal.calories = analysis.get("calories")
        meal.protein_g = analysis.get("protein_g")
        meal.carbs_g = analysis.get("carbs_g")
        meal.fat_g = analysis.get("fat_g")
        meal.fiber_g = analysis.get("fiber_g")
        meal.set_food_items(analysis.get("food_items"))
        db.commit()
        db.refresh(meal)

    return _meal_to_response(meal)


@router.get("/meals/", response_model=list[MealResponse])
def list_meals(date: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(Meal)
    if date:
        query = query.filter(Meal.date == date)
    query = query.order_by(Meal.date.desc(), Meal.time.desc())
    meals = query.all()
    return [_meal_to_response(m) for m in meals]


@router.get("/meals/{meal_id}", response_model=MealResponse)
def get_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return _meal_to_response(meal)


@router.put("/meals/{meal_id}", response_model=MealResponse)
def update_meal(meal_id: int, updates: MealUpdate, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    update_data = updates.model_dump(exclude_unset=True)
    if "food_items" in update_data:
        meal.set_food_items(update_data.pop("food_items"))

    for key, value in update_data.items():
        setattr(meal, key, value)

    db.commit()
    db.refresh(meal)
    return _meal_to_response(meal)


@router.delete("/meals/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db)):
    meal = db.query(Meal).filter(Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    # Remove image file
    if meal.image_path:
        abs_path = os.path.join(UPLOAD_DIR, meal.image_path)
        if os.path.exists(abs_path):
            os.remove(abs_path)

    db.delete(meal)
    db.commit()
    return {"detail": "Meal deleted"}


# ── Summaries ─────────────────────────────────────────────────────────────────


@router.get("/summary/daily", response_model=DailySummary)
def daily_summary(date: str = Query(...), db: Session = Depends(get_db)):
    return nutrition_service.get_daily_summary(db, date)


@router.get("/summary/weekly", response_model=WeeklySummary)
def weekly_summary(date: str = Query(...), db: Session = Depends(get_db)):
    return nutrition_service.get_weekly_summary(db, date)


# ── Goals ─────────────────────────────────────────────────────────────────────


@router.get("/goals/", response_model=DailyGoalResponse)
def get_goals(db: Session = Depends(get_db)):
    goal = db.query(DailyGoal).first()
    if not goal:
        goal = DailyGoal()
        db.add(goal)
        db.commit()
        db.refresh(goal)
    return goal


@router.put("/goals/", response_model=DailyGoalResponse)
def update_goals(updates: DailyGoalUpdate, db: Session = Depends(get_db)):
    goal = db.query(DailyGoal).first()
    if not goal:
        goal = DailyGoal()
        db.add(goal)
        db.commit()
        db.refresh(goal)

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return goal
