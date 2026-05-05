from app.config import get_settings
from app.services.mpesa import get_auth_token
from app.utils.phone import format_kenyan_phone
from app.utils.logger import logger
from datetime import datetime, timezone
import base64
import httpx


async def initiate_b2c_disbursement(
    phone_number: str,
    amount: float,
    reference: str,
    remarks: str | None = None,
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
                f"{settings.mpesa_base_url}/mpesa/b2c/v1/simulate",
                json={
                    "InitiatorCommonName": settings.mpesa_initiator_name,
                    "SecurityCredential": password,
                    "CommandID": "BusinessPayment",
                    "Amount": int(amount),
                    "PartyA": settings.mpesa_shortcode,
                    "PartyB": formatted_phone,
                    "Remarks": remarks or f"Disbursement for {reference}",
                    "QueueTimeOutURL": f"{settings.mpesa_callback_url}/b2c/timeout",
                    "ResultURL": f"{settings.mpesa_callback_url}/b2c/result",
                    "Occasion": reference,
                },
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()
            logger.info(f"B2C disbursement initiated: {reference}")
            return {
                "conversationId": data.get("ConversationID", ""),
                "originatorConversationId": data.get("OriginatorConversationID", ""),
                "responseCode": data.get("ResponseCode", "0"),
                "responseText": data.get("ResponseDesc", "Success"),
            }
        except httpx.HTTPError as e:
            logger.error(f"Failed to initiate B2C disbursement: {e}")
            raise Exception("Failed to initiate B2C disbursement")
