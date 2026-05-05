from datetime import datetime, timedelta


def calculate_next_billing_date(
    current_date: datetime, frequency: str, billing_day: int
) -> datetime:
    if frequency == "daily":
        return current_date + timedelta(days=1)
    elif frequency == "weekly":
        return current_date + timedelta(weeks=1)
    elif frequency == "monthly":
        return _add_months(current_date, 1, billing_day)
    elif frequency == "quarterly":
        return _add_months(current_date, 3, billing_day)
    elif frequency == "annually":
        return _add_months(current_date, 12, billing_day)
    return current_date + timedelta(days=30)


def _add_months(date: datetime, months: int, day_of_month: int) -> datetime:
    month = date.month - 1 + months
    year = date.year + month // 12
    month = month % 12 + 1
    day = min(day_of_month, _days_in_month(year, month))
    return date.replace(year=year, month=month, day=day)


def _days_in_month(year: int, month: int) -> int:
    if month == 12:
        return 31
    next_month = datetime(year, month + 1, 1)
    last_day = next_month - timedelta(days=1)
    return last_day.day
