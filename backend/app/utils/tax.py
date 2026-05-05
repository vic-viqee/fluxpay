def calculate_vat(amount: float, vat_rate: float = 16.0) -> tuple[float, float]:
    vat_amount = amount * (vat_rate / 100)
    total = amount + vat_amount
    return vat_amount, total
