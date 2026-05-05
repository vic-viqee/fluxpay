from datetime import datetime, timezone
from typing import Optional, Literal, Any
from beanie import Document, PydanticObjectId
from pydantic import Field


class C2BTransaction(Document):
    owner_id: Optional[PydanticObjectId] = Field(default=None, alias="ownerId")
    transaction_id: str = Field(alias="transactionId")
    transaction_type: str = Field(default="Pay Bill", alias="transactionType")
    trans_id: str = Field(alias="transID")
    trans_time: str = Field(alias="transTime")
    trans_amount: str = Field(alias="transAmount")
    business_short_code: str = Field(alias="businessShortCode")
    bill_ref_number: Optional[str] = Field(default=None, alias="billRefNumber")
    invoice_number: Optional[str] = Field(default=None, alias="invoiceNumber")
    org_account_balance: Optional[str] = Field(default=None, alias="orgAccountBalance")
    third_party_trans_id: Optional[str] = Field(default=None, alias="thirdPartyTransID")
    phone_number: str = Field(alias="phoneNumber")
    first_name: Optional[str] = Field(default=None, alias="firstName")
    middle_name: Optional[str] = Field(default=None, alias="middleName")
    last_name: Optional[str] = Field(default=None, alias="lastName")
    status: Literal["SUCCESS", "PENDING", "FAILED"] = "SUCCESS"
    is_reconciled: bool = Field(default=False, alias="isReconciled")
    reconciled_at: Optional[datetime] = Field(default=None, alias="reconciledAt")
    metadata: Optional[dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "c2btransactions"
        indexes = [
            [("owner_id", 1), ("created_at", -1)],
            "trans_id",
            "is_reconciled",
        ]
