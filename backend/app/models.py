import json
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner, snack
    date = Column(String, nullable=False)  # YYYY-MM-DD
    time = Column(String, nullable=False)  # HH:MM
    image_path = Column(String, nullable=True)
    calories = Column(Float, nullable=True)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    fiber_g = Column(Float, nullable=True)
    food_items = Column(Text, nullable=True)  # JSON string
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def get_food_items(self):
        if self.food_items:
            try:
                return json.loads(self.food_items)
            except (json.JSONDecodeError, TypeError):
                return []
        return []

    def set_food_items(self, items):
        self.food_items = json.dumps(items) if items else None


class DailyGoal(Base):
    __tablename__ = "daily_goals"

    id = Column(Integer, primary_key=True, index=True)
    calorie_goal = Column(Float, default=2000.0)
    protein_goal = Column(Float, default=150.0)
    carbs_goal = Column(Float, default=250.0)
    fat_goal = Column(Float, default=65.0)
