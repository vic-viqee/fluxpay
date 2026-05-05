import re


def format_kenyan_phone(phone: str) -> str:
    cleaned = re.sub(r"\D", "", phone)
    if cleaned.startswith("0"):
        cleaned = "254" + cleaned[1:]
    elif cleaned.startswith("+254"):
        cleaned = "254" + cleaned[4:]
    elif not cleaned.startswith("254"):
        cleaned = "254" + cleaned
    return cleaned


def is_valid_mpesa_phone(phone: str) -> dict:
    cleaned = re.sub(r"\D", "", phone)
    if not (cleaned.startswith("2541") or cleaned.startswith("2547")):
        return {
            "isValid": False,
            "message": "Phone number must start with 2541 or 2547",
        }
    if len(cleaned) != 12:
        return {
            "isValid": False,
            "message": "Phone number must be 12 digits starting with 254",
        }
    return {"isValid": True, "message": ""}
