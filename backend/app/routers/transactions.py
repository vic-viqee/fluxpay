from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional

from app.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.utils.logger import logger

router = APIRouter()


@router.get("/", response_model=dict)
async def get_transactions(
    current_user: User = Depends(get_current_user),
    status: Optional[str] = None,
    limit: int = 20,
    page: int = 1,
):
    query = [Transaction.owner_id == current_user.id]
    if status:
        query.append(Transaction.status == status)

    skip = (page - 1) * limit
    transactions = (
        await Transaction.find(*query)
        .skip(skip)
        .limit(limit)
        .sort([("transactionDate", -1)])
        .to_list()
    )
    total = await Transaction.find(*query).count()

    result = []
    for tx in transactions:
        tx_dict = tx.model_dump(by_alias=True)
        tx_dict["id"] = str(tx.id)
        tx_dict["_id"] = str(tx.id)
        result.append(tx_dict)

    return {
        "data": result,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit if limit > 0 else 1,
        "total": total,
    }


@router.get("/{transaction_id}", response_model=dict)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
):
    transaction = await Transaction.get(transaction_id)
    if not transaction or str(transaction.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Transaction not found")

    data = transaction.model_dump(by_alias=True)
    data["id"] = str(transaction.id)
    data["_id"] = str(transaction.id)
    return data


@router.get("/dashboard/stats", response_model=dict)
async def get_transaction_stats(
    current_user: User = Depends(get_current_user),
):
    # This would be implemented with proper aggregation
    return {
        "today": {"success": 0, "pending": 0, "failed": 0},
        "month": {"success": 0, "pending": 0, "failed": 0},
        "recentTransactions": [],
        "customerCount": 0,
    }
