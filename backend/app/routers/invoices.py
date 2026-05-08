from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime

from app.dependencies import get_current_user
from app.models.user import User
from app.models.invoice import Invoice
from app.models.client import Client
from app.services.invoice import create_invoice as create_invoice_record
from app.utils.logger import logger

router = APIRouter()


@router.post("/", response_model=dict)
async def create_invoice(
    invoice_data: dict,
    current_user: User = Depends(get_current_user),
):
    amount = invoice_data.get("amount") or invoice_data.get("amountKes")
    due_date = invoice_data.get("dueDate")
    if not amount or not due_date:
        raise HTTPException(status_code=400, detail="Amount and due date are required")

    invoice = await create_invoice_record(
        owner_id=str(current_user.id),
        amount_kes=float(amount),
        due_date=datetime.fromisoformat(due_date.replace("Z", "+00:00")),
        client_id=invoice_data.get("clientId"),
        subscription_id=invoice_data.get("subscriptionId"),
        plan_id=invoice_data.get("planId"),
        billing_period=invoice_data.get("billingPeriod"),
        vat_rate=16.0 if invoice_data.get("applyVat", True) else 0.0,
        notes=invoice_data.get("notes"),
    )
    return {
        "message": "Invoice created successfully",
        "data": _serialize_invoice(invoice),
    }


@router.get("/", response_model=dict)
async def get_invoices(
    current_user: User = Depends(get_current_user), limit: int = 20, page: int = 1
):
    skip = (page - 1) * limit
    invoices = (
        await Invoice.find({"owner_id": current_user.id})
        .sort([("created_at", -1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await Invoice.find({"owner_id": current_user.id}).count()
    return {"data": [_serialize_invoice(inv) for inv in invoices], "total": total}


@router.get("/{invoice_id}", response_model=dict)
async def get_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or str(invoice.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"data": _serialize_invoice(invoice)}


@router.put("/{invoice_id}", response_model=dict)
async def update_invoice(
    invoice_id: str,
    invoice_data: dict,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or str(invoice.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Invoice not found")

    allowed = {
        "status": "status",
        "mpesaReceiptNo": "mpesa_receipt_no",
        "notes": "notes",
    }
    for incoming, attr in allowed.items():
        if incoming in invoice_data:
            setattr(invoice, attr, invoice_data[incoming])
    if invoice_data.get("status") == "PAID":
        invoice.paid_date = datetime.utcnow()
    await invoice.save()

    return {
        "message": "Invoice updated successfully",
        "data": _serialize_invoice(invoice),
    }


@router.delete("/{invoice_id}", response_model=dict)
async def delete_invoice(
    invoice_id: str,
    current_user: User = Depends(get_current_user),
):
    invoice = await Invoice.get(invoice_id)
    if not invoice or str(invoice.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Invoice not found")
    await invoice.delete()
    return {"message": "Invoice deleted successfully"}


def _serialize_invoice(invoice: Invoice) -> dict:
    data = invoice.model_dump(by_alias=True)
    data["id"] = str(invoice.id)
    data["_id"] = str(invoice.id)
    return data
