from pydantic import BaseModel, field_validator
from typing import Optional
import re


class PaymentRequest(BaseModel):
    amount: float
    phone: Optional[str] = None
    phone_number: Optional[str] = None
    account_reference: Optional[str] = None
    transaction_desc: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1:
            raise ValueError("Minimum amount is 1")
        return v


class SimulateStkPushRequest(BaseModel):
    amount: float
    phone_number: str

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1:
            raise ValueError("Minimum amount is 1")
        return v


class PricingStkPushRequest(BaseModel):
    phone_number: str
    plan: str
