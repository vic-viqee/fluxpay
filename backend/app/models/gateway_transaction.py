from datetime import datetime, timezone
from typing import Optional, Any, Literal
from beanie import PydanticObjectId
from pydantic import Field
from app.models.base import BaseDocument


class GatewayTransaction(BaseDocument):
    owner_id: PydanticObjectId = Field(alias="ownerId")
    customer_id: Optional[PydanticObjectId] = Field(default=None, alias="customerId")
    payment_link_id: Optional[PydanticObjectId] = Field(
        default=None, alias="paymentLinkId"
    )
    amount_kes: float = Field(alias="amountKes")
    status: Literal["PENDING", "SUCCESS", "FAILED", "CANCELLED"] = "PENDING"
    mpesa_receipt_no: Optional[str] = Field(default=None, alias="mpesaReceiptNo")
    daraja_request_id: Optional[str] = Field(default=None, alias="darajaRequestId")
    checkout_request_id: Optional[str] = Field(default=None, alias="checkoutRequestId")
    phone_number: str = Field(alias="phoneNumber")
    account_reference: str = Field(alias="accountReference")
    transaction_desc: Optional[str] = Field(default=None, alias="transactionDesc")
    payment_method: Literal["STK_PUSH", "PAYMENT_LINK", "TILL", "QR"] = Field(
        default="STK_PUSH", alias="paymentMethod"
    )
    payment_source: Literal["gateway_api", "payment_link", "dynamic_till"] = Field(
        default="gateway_api", alias="paymentSource"
    )
    transaction_id: Optional[str] = Field(default=None, alias="transactionId")
    callback_data: Optional[dict[str, Any]] = Field(default=None, alias="callbackData")
    failure_reason: Optional[str] = Field(default=None, alias="failureReason")
    transaction_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), alias="transactionDate"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "gatewaytransactions"
        indexes = [
            [("owner_id", 1), ("transaction_date", -1)],
            "daraja_request_id",
            "mpesa_receipt_no",
            "status",
            "account_reference",
        ]
