import base64
import json
import logging
from pathlib import Path

from openai import OpenAI

from app.config import OPENAI_API_KEY

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """Analyze this meal image and estimate the nutritional content.
Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "calories": <number>,
  "protein_g": <number>,
  "carbs_g": <number>,
  "fat_g": <number>,
  "fiber_g": <number>,
  "food_items": [
    {"name": "<food name>", "estimated_calories": <number>}
  ]
}

Be as accurate as possible with your estimates. Identify every distinct food item visible."""


def analyze_meal_image(image_path: str) -> dict:
    """Send an image to OpenAI GPT-4o vision and return parsed nutrition data.

    Returns a dict with keys: calories, protein_g, carbs_g, fat_g, fiber_g, food_items.
    On any failure, values will be None.
    """
    empty = {
        "calories": None,
        "protein_g": None,
        "carbs_g": None,
        "fat_g": None,
        "fiber_g": None,
        "food_items": None,
    }

    if not OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not set; skipping meal analysis.")
        return empty

    try:
        path = Path(image_path)
        if not path.exists():
            logger.error("Image file not found: %s", image_path)
            return empty

        image_data = base64.b64encode(path.read_bytes()).decode("utf-8")

        # Determine media type
        suffix = path.suffix.lower()
        media_types = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
        media_type = media_types.get(suffix, "image/jpeg")

        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": ANALYSIS_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{image_data}",
                                "detail": "low",
                            },
                        },
                    ],
                }
            ],
            max_tokens=1024,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()

        data = json.loads(raw)
        return {
            "calories": data.get("calories"),
            "protein_g": data.get("protein_g"),
            "carbs_g": data.get("carbs_g"),
            "fat_g": data.get("fat_g"),
            "fiber_g": data.get("fiber_g"),
            "food_items": data.get("food_items"),
        }

    except Exception:
        logger.exception("Failed to analyze meal image")
        return empty
