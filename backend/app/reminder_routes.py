
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from .database import get_db
from .models import User, Subscription, FreeTrial
from .auth import get_current_user


router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)


def get_priority(days_remaining):
    if days_remaining <= 1:
        return "Urgent"
    elif days_remaining <= 3:
        return "High"
    else:
        return "Medium"


@router.get("/")
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    reminders = []

    # --------------------------------------------------
    # Subscription reminders
    # --------------------------------------------------

    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).all()

    for subscription in subscriptions:

        try:
            renewal_date = date.fromisoformat(
                subscription.renewal_date
            )
        except (ValueError, TypeError):
            continue

        days_remaining = (
            renewal_date - today
        ).days

        if 0 <= days_remaining <= 7:

            priority = get_priority(days_remaining)

            if days_remaining == 0:
                message = (
                    f"{subscription.service_name} renews today."
                )
            else:
                message = (
                    f"{subscription.service_name} renews "
                    f"in {days_remaining} days."
                )

            reminders.append({
                "type": "Subscription",
                "id": subscription.id,
                "service_name": subscription.service_name,
                "message": message,
                "amount": subscription.amount,
                "currency": subscription.currency,
                "date": subscription.renewal_date,
                "days_remaining": days_remaining,
                "priority": priority
            })

    # --------------------------------------------------
    # Free-trial reminders
    # --------------------------------------------------

    free_trials = db.query(FreeTrial).filter(
        FreeTrial.user_id == current_user.id
    ).all()

    for trial in free_trials:

        try:
            end_date = date.fromisoformat(
                trial.end_date
            )
        except (ValueError, TypeError):
            continue

        days_remaining = (
            end_date - today
        ).days

        if 0 <= days_remaining <= 7:

            priority = get_priority(days_remaining)

            if days_remaining == 0:
                message = (
                    f"{trial.service_name} free trial "
                    f"ends today."
                )
            else:
                message = (
                    f"{trial.service_name} free trial "
                    f"ends in {days_remaining} days."
                )

            reminders.append({
                "type": "Free Trial",
                "id": trial.id,
                "service_name": trial.service_name,
                "message": message,
                "amount": trial.amount_after_trial,
                "currency": trial.currency,
                "date": trial.end_date,
                "days_remaining": days_remaining,
                "priority": priority
            })

    # --------------------------------------------------
    # Sort urgent reminders first
    # --------------------------------------------------

    reminders.sort(
        key=lambda reminder: reminder["days_remaining"]
    )

    return {
        "total_reminders": len(reminders),
        "reminders": reminders
    }

