import json
import logging

from openai import OpenAI

from app.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)


def get_suggestions(daily_summary: dict, goals: dict) -> list[dict]:
    """Return 3-5 food suggestions based on remaining nutrition budget.

    Parameters
    ----------
    daily_summary : dict with total_calories, total_protein_g, total_carbs_g, total_fat_g
    goals : dict with calorie_goal, protein_goal, carbs_goal, fat_goal
    """
    remaining_cal = goals["calorie_goal"] - daily_summary["total_calories"]
    remaining_protein = goals["protein_goal"] - daily_summary["total_protein_g"]
    remaining_carbs = goals["carbs_goal"] - daily_summary["total_carbs_g"]
    remaining_fat = goals["fat_goal"] - daily_summary["total_fat_g"]

    if not OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set; returning empty suggestions.")
        return []

    prompt = f"""Based on the following remaining daily nutrition budget, suggest 3-5 specific foods or meals.

Remaining budget:
- Calories: {remaining_cal:.0f} kcal
- Protein: {remaining_protein:.0f} g
- Carbs: {remaining_carbs:.0f} g
- Fat: {remaining_fat:.0f} g

Already consumed today:
- Calories: {daily_summary['total_calories']:.0f} kcal
- Protein: {daily_summary['total_protein_g']:.0f} g
- Carbs: {daily_summary['total_carbs_g']:.0f} g
- Fat: {daily_summary['total_fat_g']:.0f} g

Return ONLY valid JSON (no markdown, no code fences) as an array of objects:
[
  {{
    "name": "<food name>",
    "description": "<brief description and serving size>",
    "estimated_calories": <number>,
    "estimated_protein": <number>,
    "reason": "<why this fits the remaining budget>"
  }}
]

Focus on practical, common foods. Prioritize hitting protein targets if protein is still needed."""

    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()

        return json.loads(raw)

    except Exception:
        logger.exception("Failed to get food suggestions")
        return []
