import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./diet_tracker.db")
UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)
