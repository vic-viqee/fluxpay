from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GatewayPaymentRequest(BaseModel):
    amount: float
    phone_number: str
    account_reference: str
    transaction_desc: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None


class PaymentLinkCreate(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    redirect_url: Optional[str] = None
    webhook_url: Optional[str] = None


class GatewayCustomerCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone_number: str
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class GatewayCustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class SubscriptionCreate(BaseModel):
    client_id: str = Field(alias="clientId")
    plan_id: str = Field(alias="planId")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class SubscriptionUpdate(BaseModel):
    client_id: Optional[str] = Field(default=None, alias="clientId")
    plan_id: Optional[str] = Field(default=None, alias="planId")
    status: Optional[str] = None
    next_billing_date: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        populate_by_name = True


class ClientCreate(BaseModel):
    name: str
    phone_number: str = Field(alias="phoneNumber")
    email: Optional[str] = None

    class Config:
        populate_by_name = True


class PlanCreate(BaseModel):
    name: str
    amount_kes: float = Field(alias="amountKes")
    frequency: str
    billing_day: int = Field(alias="billingDay")

    class Config:
        populate_by_name = True


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    amount_kes: Optional[float] = Field(default=None, alias="amountKes")
    frequency: Optional[str] = None
    billing_day: Optional[int] = Field(default=None, alias="billingDay")

    class Config:
        populate_by_name = True


class InvoiceCreate(BaseModel):
    amount_kes: float
    due_date: datetime
    client_id: Optional[str] = None
    subscription_id: Optional[str] = None
    plan_id: Optional[str] = None
    billing_period: Optional[str] = None
    vat_rate: float = 16.0
    notes: Optional[str] = None


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


class WebhookCreate(BaseModel):
    url: str
    secret: str
    events: List[str]


class ApiKeyCreate(BaseModel):
    name: str
    expires_at: Optional[datetime] = None


class PublicCheckoutButtonCreate(BaseModel):
    title: str
    description: Optional[str] = None
    default_amount: Optional[float] = None
    allow_custom_amount: bool = True
    redirect_url: Optional[str] = None
    button_text: Optional[str] = None
    button_color: Optional[str] = None
