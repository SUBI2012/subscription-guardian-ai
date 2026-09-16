
from pydantic import BaseModel


class SubscriptionCreate(BaseModel):

    service_name: str
    amount: int
    currency: str = "INR"
    billing_cycle: str
    subscription_type: str
    category: str | None = None
    renewal_date: str


class UserCreate(BaseModel):

    name: str
    email: str
    password: str


class UserLogin(BaseModel):

    email: str
    password: str

    
class FreeTrialCreate(BaseModel):

    service_name: str
    start_date: str
    end_date: str
    amount_after_trial: int
    currency: str = "INR"
    billing_cycle: str = "Monthly"
    category: str | None = None
