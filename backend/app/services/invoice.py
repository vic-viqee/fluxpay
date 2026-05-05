from datetime import datetime, timezone
from typing import Optional
from beanie import PydanticObjectId

from app.models.invoice import Invoice
from app.utils.tax import calculate_vat
from app.utils.logger import logger


async def generate_invoice_number() -> str:
    count = await Invoice.count()
    return f"INV-{count + 1:06d}"


async def create_invoice(
    owner_id: str,
    amount_kes: float,
    due_date: datetime,
    client_id: Optional[str] = None,
    subscription_id: Optional[str] = None,
    plan_id: Optional[str] = None,
    billing_period: Optional[str] = None,
    vat_rate: float = 16.0,
    notes: Optional[str] = None,
) -> Invoice:
    invoice_number = await generate_invoice_number()
    vat_amount, total_amount = calculate_vat(amount_kes, vat_rate)

    invoice = Invoice(
        invoice_number=invoice_number,
        owner_id=PydanticObjectId(owner_id),
        client_id=PydanticObjectId(client_id) if client_id else None,
        subscription_id=PydanticObjectId(subscription_id) if subscription_id else None,
        plan_id=PydanticObjectId(plan_id) if plan_id else None,
        amount_kes=amount_kes,
        vat_rate=vat_rate,
        vat_amount=vat_amount,
        total_amount=total_amount,
        billing_period=billing_period,
        due_date=due_date,
        notes=notes,
    )
    await invoice.create()
    logger.info(f"Invoice created: {invoice_number}")
    return invoice
