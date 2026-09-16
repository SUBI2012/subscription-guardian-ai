from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .database import get_db
from .models import User
from .auth import (
    get_current_user,
    verify_password,
    hash_password
)


router = APIRouter()


# -----------------------------
# Request Models
# -----------------------------

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


# -----------------------------
# GET PROFILE
# -----------------------------

@router.get("")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


# -----------------------------
# UPDATE PROFILE
# -----------------------------

@router.put("")
def update_profile(
    request: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not request.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if not request.email.strip():
        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty"
        )

    current_user.name = request.name.strip()
    current_user.email = request.email.strip()

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


# -----------------------------
# CHANGE PASSWORD
# -----------------------------

@router.put("/change-password")
def change_password(
    request: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check current password
    if not verify_password(
        request.current_password,
        current_user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Check new password length
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters"
        )

    # Check password confirmation
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New passwords do not match"
        )

    # Prevent using the same password
    if verify_password(
        request.new_password,
        current_user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from the current password"
        )

    # Hash and save the new password
    current_user.password_hash = hash_password(
        request.new_password
    )

    db.commit()

    return {
        "message": "Password changed successfully"
    }