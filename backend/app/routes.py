from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import Subscription, User
from .schemas import SubscriptionCreate
from .auth import get_current_user


router = APIRouter(
    tags=["Subscriptions"]
)


# --------------------------------------------------
# CREATE SUBSCRIPTION
# --------------------------------------------------

@router.post("/")
def create_subscription(
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_subscription = Subscription(
        user_id=current_user.id,
        service_name=subscription.service_name,
        amount=subscription.amount,
        currency=subscription.currency,
        billing_cycle=subscription.billing_cycle,
        subscription_type=subscription.subscription_type,
        category=subscription.category,
        renewal_date=subscription.renewal_date
    )

    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)

    return new_subscription


# --------------------------------------------------
# GET ALL SUBSCRIPTIONS
# --------------------------------------------------

@router.get("/")
def get_subscriptions(
    search: Optional[str] = None,
    category: Optional[str] = None,
    billing_cycle: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    )

    if search:
        query = query.filter(
            Subscription.service_name.ilike(
                f"%{search}%"
            )
        )

    if category:
        query = query.filter(
            Subscription.category.ilike(category)
        )

    if billing_cycle:
        query = query.filter(
            Subscription.billing_cycle.ilike(
                billing_cycle
            )
        )

    subscriptions = query.all()

    return subscriptions


# --------------------------------------------------
# GET UPCOMING SUBSCRIPTIONS
# IMPORTANT:
# Keep this before /{subscription_id}
# --------------------------------------------------

@router.get("/upcoming")
def get_upcoming_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    upcoming_date = today + timedelta(days=7)

    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).all()

    upcoming = []

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

            upcoming.append({
                "id": subscription.id,
                "service_name": subscription.service_name,
                "amount": subscription.amount,
                "currency": subscription.currency,
                "billing_cycle": subscription.billing_cycle,
                "renewal_date": subscription.renewal_date,
                "days_remaining": days_remaining
            })

    return upcoming


# --------------------------------------------------
# GET ONE SUBSCRIPTION
# --------------------------------------------------

@router.get("/{subscription_id}")
def get_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if subscription is None:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found"
        )

    return subscription


# --------------------------------------------------
# UPDATE SUBSCRIPTION
# --------------------------------------------------

@router.put("/{subscription_id}")
def update_subscription(
    subscription_id: int,
    subscription: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if existing_subscription is None:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found"
        )

    # Do not change user_id.
    existing_subscription.service_name = (
        subscription.service_name
    )
    existing_subscription.amount = (
        subscription.amount
    )
    existing_subscription.currency = (
        subscription.currency
    )
    existing_subscription.billing_cycle = (
        subscription.billing_cycle
    )
    existing_subscription.subscription_type = (
        subscription.subscription_type
    )
    existing_subscription.category = (
        subscription.category
    )
    existing_subscription.renewal_date = (
        subscription.renewal_date
    )

    db.commit()
    db.refresh(existing_subscription)

    return existing_subscription


# --------------------------------------------------
# DELETE SUBSCRIPTION
# --------------------------------------------------

@router.delete("/{subscription_id}")
def delete_subscription(
    subscription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if subscription is None:
        raise HTTPException(
            status_code=404,
            detail="Subscription not found"
        )

    db.delete(subscription)
    db.commit()

    return {
        "message": "Subscription deleted successfully"
    }