from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import UPLOAD_DIR
from app.database import Base, engine
from app.routers import analysis, meals, suggestions

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Diet Tracker API", version="1.0.0")

# CORS - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(meals.router, prefix="/api", tags=["meals"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(suggestions.router, prefix="/api", tags=["suggestions"])


@app.get("/")
def root():
    return {"message": "Diet Tracker API is running"}
