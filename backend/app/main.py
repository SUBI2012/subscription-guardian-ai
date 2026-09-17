from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base

from .routes import router
from .auth_routes import router as auth_router
from .dashboard_routes import router as dashboard_router
from .free_trial_routes import router as free_trial_router
from .reminder_routes import router as reminder_router
from .ai_routes import router as ai_router
from .profile_routes import router as profile_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Subscription Guardian AI API",
    description="Backend API for Subscription Guardian AI",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "https://subscription-guardian-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication
# auth_routes.py already has prefix="/auth"
app.include_router(auth_router)


# Subscriptions
# routes.py has no prefix; main provides it
app.include_router(
    router,
    prefix="/subscriptions",
    tags=["Subscriptions"]
)


# Dashboard
# dashboard_routes.py already has prefix="/dashboard"
app.include_router(dashboard_router)


# Free Trials
# main provides /free-trials
app.include_router(
    free_trial_router,
    prefix="/free-trials",
    tags=["Free Trials"]
)


# Reminders
# reminder_routes.py already has prefix="/reminders"
app.include_router(reminder_router)


# AI
# main provides /ai
app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"]
)


# Profile
# main provides /profile
app.include_router(
    profile_router,
    prefix="/profile",
    tags=["Profile"]
)


@app.get("/")
def root():
    return {
        "message": "Subscription Guardian AI API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }