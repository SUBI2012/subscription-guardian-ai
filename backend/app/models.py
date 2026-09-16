from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    subscriptions = relationship(
    "Subscription",
    back_populates="user",
    cascade="all, delete-orphan"
)
    free_trials = relationship(
    "FreeTrial",
    back_populates="user",
    cascade="all, delete-orphan"
)


class Subscription(Base):

    __tablename__ = "subscriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
    Integer,
    ForeignKey("users.id"),
    nullable=False
)

    service_name = Column(
        String(100),
        nullable=False
    )

    amount = Column(
        Integer,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR"
    )

    billing_cycle = Column(
        String(50),
        nullable=False
    )

    subscription_type = Column(
        String(50),
        nullable=False
    )

    category = Column(
        String(100),
        nullable=True
    )

    renewal_date = Column(
        String(50),
        nullable=False
    )

    status = Column(
        String(50),
        default="active"
    )
    user = relationship(
    "User",
    back_populates="subscriptions"
)

class FreeTrial(Base):

    __tablename__ = "free_trials"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    service_name = Column(
        String(100),
        nullable=False
    )

    start_date = Column(
        String,
        nullable=False
    )

    end_date = Column(
        String,
        nullable=False
    )

    amount_after_trial = Column(
        Integer,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR"
    )

    billing_cycle = Column(
        String(50),
        default="Monthly"
    )

    category = Column(
        String(100),
        nullable=True
    )

    status = Column(
        String(50),
        default="active"
    )

    user = relationship(
        "User",
        back_populates="free_trials"
    )
