
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import FreeTrial, User
from .schemas import FreeTrialCreate
from .auth import get_current_user


router = APIRouter()


@router.post("/")
def create_free_trial(
    trial: FreeTrialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_trial = FreeTrial(
        user_id=current_user.id,
        service_name=trial.service_name,
        start_date=trial.start_date,
        end_date=trial.end_date,
        amount_after_trial=trial.amount_after_trial,
        currency=trial.currency,
        billing_cycle=trial.billing_cycle,
        category=trial.category,
        status="active"
    )

    db.add(new_trial)
    db.commit()
    db.refresh(new_trial)

    return new_trial


@router.get("/")
def get_free_trials(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    trials = db.query(FreeTrial).filter(
        FreeTrial.user_id == current_user.id
    ).all()

    return trials


@router.get("/{trial_id}")
def get_free_trial(
    trial_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    trial = db.query(FreeTrial).filter(
        FreeTrial.id == trial_id,
        FreeTrial.user_id == current_user.id
    ).first()

    if not trial:
        raise HTTPException(
            status_code=404,
            detail="Free trial not found"
        )

    return trial


@router.put("/{trial_id}")
def update_free_trial(
    trial_id: int,
    trial: FreeTrialCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    existing_trial = db.query(FreeTrial).filter(
        FreeTrial.id == trial_id,
        FreeTrial.user_id == current_user.id
    ).first()

    if not existing_trial:
        raise HTTPException(
            status_code=404,
            detail="Free trial not found"
        )

    existing_trial.service_name = trial.service_name
    existing_trial.start_date = trial.start_date
    existing_trial.end_date = trial.end_date
    existing_trial.amount_after_trial = trial.amount_after_trial
    existing_trial.currency = trial.currency
    existing_trial.billing_cycle = trial.billing_cycle
    existing_trial.category = trial.category

    db.commit()
    db.refresh(existing_trial)

    return existing_trial


@router.delete("/{trial_id}")
def delete_free_trial(
    trial_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    trial = db.query(FreeTrial).filter(
        FreeTrial.id == trial_id,
        FreeTrial.user_id == current_user.id
    ).first()

    if not trial:
        raise HTTPException(
            status_code=404,
            detail="Free trial not found"
        )

    db.delete(trial)
    db.commit()

    return {
        "message": "Free trial deleted successfully"
    }

