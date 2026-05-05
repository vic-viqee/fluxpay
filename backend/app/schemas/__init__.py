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


class GatewayPaymentRequest(BaseModel):
    amount: float
    phone_number: str
    account_reference: str
    transaction_desc: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1:
            raise ValueError("Minimum amount is 1")
        return v


class SubscriptionCreate(BaseModel):
    client_id: str
    plan_id: str
    notes: Optional[str] = None


class SubscriptionUpdate(BaseModel):
    client_id: Optional[str] = None
    plan_id: Optional[str] = None
    status: Optional[str] = None
    next_billing_date: Optional[str] = None
    notes: Optional[str] = None


class ClientCreate(BaseModel):
    name: str
    phone_number: str
    email: Optional[str] = None


class PlanCreate(BaseModel):
    name: str
    amount_kes: float
    frequency: str
    billing_day: int

    @field_validator("amount_kes")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1:
            raise ValueError("Minimum amount is 1")
        return v

    @field_validator("billing_day")
    @classmethod
    def validate_billing_day(cls, v: int) -> int:
        if v < 1 or v > 31:
            raise ValueError("Billing day must be between 1 and 31")
        return v


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    amount_kes: Optional[float] = None
    frequency: Optional[str] = None
    billing_day: Optional[int] = None


class PaymentLinkCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    expires_at: Optional[str] = None
    max_uses: Optional[int] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    redirect_url: Optional[str] = None
    webhook_url: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v < 1:
            raise ValueError("Minimum amount is 1")
        return v


class GatewayCustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone_number: str
    notes: Optional[str] = None
    tags: Optional[list[str]] = None


class GatewayCustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[list[str]] = None


class ReversalRequest(BaseModel):
    transaction_id: str
    reason: str


class DisbursementRequest(BaseModel):
    phone_number: str
    amount: float
    reference: str
    remarks: Optional[str] = None


class C2BRegisterRequest(BaseModel):
    confirmation_url: str
