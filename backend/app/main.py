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


# ------------------------------------------------------
# Create database tables
# ------------------------------------------------------

Base.metadata.create_all(bind=engine)


# ------------------------------------------------------
# Create FastAPI application
# ------------------------------------------------------

app = FastAPI(
    title="Subscription Guardian AI API",
    description="Backend API for Subscription Guardian AI",
    version="1.0.0"
)


# ------------------------------------------------------
# CORS
# ------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------
# API ROUTES
# ------------------------------------------------------

# ------------------------------------------------------
# AUTHENTICATION
# ------------------------------------------------------
# auth_routes.py already has:
# prefix="/auth"
#
# Therefore DO NOT add another prefix here.
#
# Final routes:
# /auth/register
# /auth/login
# /auth/token

app.include_router(
    auth_router
)


# ------------------------------------------------------
# SUBSCRIPTIONS
# ------------------------------------------------------
# Main prefix for subscription routes.

app.include_router(
    router,
    prefix="/subscriptions",
    tags=["Subscriptions"]
)


# ------------------------------------------------------
# DASHBOARD
# ------------------------------------------------------
# dashboard_routes.py already contains:
# prefix="/dashboard"

app.include_router(
    dashboard_router
)


# ------------------------------------------------------
# FREE TRIALS
# ------------------------------------------------------
# Main provides /free-trials.

app.include_router(
    free_trial_router,
    prefix="/free-trials",
    tags=["Free Trials"]
)


# ------------------------------------------------------
# REMINDERS
# ------------------------------------------------------
# reminder_routes.py already contains:
# prefix="/reminders"

app.include_router(
    reminder_router
)


# ------------------------------------------------------
# AI
# ------------------------------------------------------
# Main provides /ai.

app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"]
)


# ------------------------------------------------------
# PROFILE
# ------------------------------------------------------
# profile_routes.py does not have a prefix.
# Main provides /profile.

app.include_router(
    profile_router,
    prefix="/profile",
    tags=["Profile"]
)


# ------------------------------------------------------
# ROOT
# ------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Subscription Guardian AI API is running"
    }


# ------------------------------------------------------
# HEALTH CHECK
# ------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }