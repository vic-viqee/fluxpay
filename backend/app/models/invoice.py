from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import Document, PydanticObjectId
from pydantic import Field


class Invoice(Document):
    invoice_number: str = Field(unique=True, alias="invoiceNumber")
    owner_id: PydanticObjectId = Field(alias="ownerId")
    client_id: Optional[PydanticObjectId] = Field(default=None, alias="clientId")
    subscription_id: Optional[PydanticObjectId] = Field(
        default=None, alias="subscriptionId"
    )
    plan_id: Optional[PydanticObjectId] = Field(default=None, alias="planId")
    status: Literal["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] = "DRAFT"
    amount_kes: float = Field(alias="amountKes")
    vat_rate: float = Field(default=16, alias="vatRate")
    vat_amount: float = Field(default=0, alias="vatAmount")
    total_amount: float = Field(alias="totalAmount")
    billing_period: Optional[str] = Field(default=None, alias="billingPeriod")
    due_date: datetime = Field(alias="dueDate")
    paid_date: Optional[datetime] = Field(default=None, alias="paidDate")
    mpesa_receipt_no: Optional[str] = Field(default=None, alias="mpesaReceiptNo")
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "invoices"
        populate_by_name = True
        indexes = [
            "owner_id",
            "invoice_number",
            "status",
        ]
