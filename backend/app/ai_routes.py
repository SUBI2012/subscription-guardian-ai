from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from .auth import get_current_user
from .models import User
from .ai.parser import parse_subscription_text


router = APIRouter()


class AITextRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=5,
        max_length=5000
    )


@router.post("/parse")
def parse_text(
    request: AITextRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        text = request.text.strip()

        if not text:
            raise HTTPException(
                status_code=400,
                detail="Please enter subscription text."
            )

        if len(text) < 5:
            raise HTTPException(
                status_code=400,
                detail="Please enter at least 5 characters."
            )

        result = parse_subscription_text(text)

        if not result:
            raise HTTPException(
                status_code=422,
                detail="Unable to extract subscription information from the text."
            )

        return {
            "success": True,
            "data": result
        }

    except HTTPException:
        raise

    except Exception as error:
        print("AI Parser Error:", error)

        raise HTTPException(
            status_code=500,
            detail="AI Parser failed to process the text."
        )
