import base64
from datetime import datetime, timezone
from typing import Optional
import httpx
from aiocache import Cache

from app.config import get_settings
from app.utils.phone import format_kenyan_phone
from app.utils.logger import logger

token_cache = Cache(ttl=3500)


async def get_auth_token() -> str:
    cached = await token_cache.get("mpesa_token")
    if cached:
        return cached

    settings = get_settings()
    credentials = base64.b64encode(
        f"{settings.mpesa_consumer_key}:{settings.mpesa_consumer_secret}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{settings.mpesa_base_url}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {credentials}"},
            )
            response.raise_for_status()
            data = response.json()
            token = data["access_token"]
            ttl = int(data.get("expires_in", 3600)) - 60
            await token_cache.set("mpesa_token", token, ttl=ttl)
            logger.info("M-Pesa auth token generated successfully")
            return token
        except httpx.HTTPError as e:
            logger.error(f"Failed to generate M-Pesa auth token: {e}")
            raise Exception("Failed to authenticate with M-Pesa")


async def initiate_stk_push(
    phone_number: str,
    amount: float,
    account_reference: str = "FluxPay",
    transaction_desc: str = "FluxPay Payment",
) -> dict:
    settings = get_settings()
    token = await get_auth_token()
    formatted_phone = format_kenyan_phone(phone_number)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{settings.mpesa_shortcode}{settings.mpesa_passkey}{timestamp}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.mpesa_base_url}/mpesa/stkpush/v1/processrequest",
                json={
                    "BusinessShortCode": settings.mpesa_shortcode,
                    "Password": password,
                    "Timestamp": timestamp,
                    "TransactionType": "CustomerPayBillOnline",
                    "Amount": int(amount),
                    "PartyA": formatted_phone,
                    "PartyB": settings.mpesa_shortcode,
                    "PhoneNumber": formatted_phone,
                    "CallBackURL": settings.mpesa_callback_url,
                    "AccountReference": account_reference,
                    "TransactionDesc": transaction_desc,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            logger.info("STK push initiated successfully")
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Failed to initiate STK push: {e}")
            raise Exception("Failed to initiate STK push")


async def get_account_balance() -> dict:
    settings = get_settings()
    token = await get_auth_token()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{settings.mpesa_shortcode}{settings.mpesa_passkey}{timestamp}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.mpesa_base_url}/mpesa/accountbalance/v1/query",
                json={
                    "BusinessShortCode": settings.mpesa_shortcode,
                    "Password": password,
                    "Timestamp": timestamp,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            data = response.json()
            balances = data.get("Result", {}).get("Balances", [{}])[0]
            return {
                "availableBalance": balances.get("AvailableBalance", "0"),
                "reservedBalance": balances.get("ReservedBalance", "0"),
                "unclearedBalance": balances.get("UnclearedBalance", "0"),
            }
        except httpx.HTTPError as e:
            logger.error(f"Failed to query account balance: {e}")
            raise Exception("Failed to query account balance")


async def get_transaction_status(checkout_request_id: str) -> dict:
    settings = get_settings()
    token = await get_auth_token()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{settings.mpesa_shortcode}{settings.mpesa_passkey}{timestamp}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.mpesa_base_url}/mpesa/stkpushquery/v1/query",
                json={
                    "BusinessShortCode": settings.mpesa_shortcode,
                    "Password": password,
                    "Timestamp": timestamp,
                    "CheckoutRequestID": checkout_request_id,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            data = response.json()
            status_data = data.get("Result", {})
            return {
                "transactionId": checkout_request_id,
                "transactionStatus": status_data.get("TransactionStatus", "Unknown"),
                "amount": "0",
                "recipient": status_data.get("RefNumber", ""),
                "transactionDate": datetime.now(timezone.utc).isoformat(),
            }
        except httpx.HTTPError as e:
            logger.error(f"Failed to query transaction status: {e}")
            raise Exception("Failed to query transaction status")


async def register_c2b_urls(
    short_code: str,
    callback_url: str,
    confirmation_url: str,
    validation_url: Optional[str] = None,
) -> dict:
    settings = get_settings()
    token = await get_auth_token()

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.mpesa_base_url}/mpesa/c2b/v1/registerurl",
                json={
                    "ShortCode": short_code,
                    "ResponseType": "Completed",
                    "ConfirmationURL": confirmation_url,
                    "ValidationURL": validation_url or confirmation_url,
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            logger.info("C2B URLs registered successfully")
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"Failed to register C2B URLs: {e}")
            raise Exception("Failed to register C2B URLs")


async def reverse_transaction(
    transaction_id: str,
    amount: float,
    receiver_party: str,
    initiator_name: Optional[str] = None,
) -> dict:
    settings = get_settings()
    token = await get_auth_token()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(
        f"{settings.mpesa_shortcode}{settings.mpesa_passkey}{timestamp}".encode()
    ).decode()
    initiator = initiator_name or settings.mpesa_initiator_name

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.mpesa_base_url}/mpesa/reversal/v1/request",
                json={
                    "Initiator": initiator,
                    "SecurityCredential": password,
                    "CommandID": "TransactionReversal",
                    "TransactionID": transaction_id,
                    "Amount": int(amount),
                    "ReceiverParty": receiver_party,
                    "RecieverIdentifierType": "11",
                    "ResultURL": f"{settings.mpesa_callback_url}/reversal/result",
                    "QueueTimeOutURL": f"{settings.mpesa_callback_url}/reversal/timeout",
                    "Remarks": "Transaction reversal request",
                    "Occasion": "Reversal",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            data = response.json()
            logger.info(f"Reversal initiated for transaction: {transaction_id}")
            return {
                "conversationId": data.get("ConversationID", ""),
                "originatorConversationId": data.get("OriginatorConversationID", ""),
                "responseCode": data.get("ResponseCode", ""),
                "responseDescription": data.get("ResponseDescription", ""),
            }
        except httpx.HTTPError as e:
            logger.error(f"Failed to initiate reversal: {e}")
            raise Exception("Failed to initiate transaction reversal")
