from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from .database import get_db
from .models import User, Subscription, FreeTrial
from .auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    today = date.today()
    upcoming_date = today + timedelta(days=7)


    # ==========================================
    # GET USER SUBSCRIPTIONS
    # ==========================================

    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).all()


    # ==========================================
    # ACTIVE SUBSCRIPTIONS
    # ==========================================

    active_subscriptions = len(subscriptions)


    # ==========================================
    # MONTHLY SPENDING
    # ==========================================

    monthly_spending = 0

    for subscription in subscriptions:

        billing_cycle = (
            subscription.billing_cycle or ""
        ).lower()

        if billing_cycle == "monthly":

            monthly_spending += subscription.amount

        elif billing_cycle == "yearly":

            monthly_spending += (
                subscription.amount / 12
            )


    # ==========================================
    # YEARLY SPENDING
    # ==========================================

    yearly_spending = monthly_spending * 12


    # ==========================================
    # CATEGORY SPENDING
    # ==========================================

    category_spending = {}

    for subscription in subscriptions:

        category = (
            subscription.category
            or "Uncategorized"
        )

        billing_cycle = (
            subscription.billing_cycle or ""
        ).lower()

        amount = subscription.amount

        # Convert yearly amount to monthly equivalent
        if billing_cycle == "yearly":
            amount = amount / 12

        if category not in category_spending:
            category_spending[category] = 0

        category_spending[category] += amount


    # ==========================================
    # CATEGORY COUNTS
    # ==========================================

    category_counts = {}

    for subscription in subscriptions:

        category = (
            subscription.category
            or "Uncategorized"
        )

        if category not in category_counts:
            category_counts[category] = 0

        category_counts[category] += 1


    # ==========================================
    # UPCOMING SUBSCRIPTIONS
    # ==========================================

    upcoming_subscriptions = []

    for subscription in subscriptions:

        try:

            renewal_date = date.fromisoformat(
                subscription.renewal_date
            )

        except (ValueError, TypeError):

            continue


        if today <= renewal_date <= upcoming_date:

            days_remaining = (
                renewal_date - today
            ).days

            upcoming_subscriptions.append({

                "id": subscription.id,

                "service_name":
                    subscription.service_name,

                "amount":
                    subscription.amount,

                "currency":
                    subscription.currency,

                "renewal_date":
                    subscription.renewal_date,

                "billing_cycle":
                    subscription.billing_cycle,

                "days_remaining":
                    days_remaining
            })


    # ==========================================
    # GET USER FREE TRIALS
    # ==========================================

    free_trials = db.query(FreeTrial).filter(
        FreeTrial.user_id == current_user.id
    ).all()


    # ==========================================
    # UPCOMING FREE TRIALS
    # ==========================================

    upcoming_free_trials = []

    for trial in free_trials:

        try:

            end_date = date.fromisoformat(
                trial.end_date
            )

        except (ValueError, TypeError):

            continue


        if today <= end_date <= upcoming_date:

            days_remaining = (
                end_date - today
            ).days

            upcoming_free_trials.append({

                "id": trial.id,

                "service_name":
                    trial.service_name,

                "end_date":
                    trial.end_date,

                "amount_after_trial":
                    trial.amount_after_trial,

                "currency":
                    trial.currency,

                "days_remaining":
                    days_remaining
            })


    # ==========================================
    # RETURN DASHBOARD DATA
    # ==========================================

    return {

        "active_subscriptions":
            active_subscriptions,

        "monthly_spending":
            round(monthly_spending, 2),

        "yearly_spending":
            round(yearly_spending, 2),

        "category_spending": {
            key: round(value, 2)
            for key, value
            in category_spending.items()
        },

        "category_counts":
            category_counts,

        "upcoming_subscriptions":
            upcoming_subscriptions,

        "upcoming_free_trials":
            upcoming_free_trials
    }