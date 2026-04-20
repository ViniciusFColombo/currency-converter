from fastapi import APIRouter
from app.services import fetch_currency_data


router = APIRouter()

@router.get("/prices")
def get_prices(from_curr: str = "EUR", to_curr: str = "BRL"):
    data = fetch_currency_data()

    pair = f"{from_curr}{to_curr}"

    if pair not in data:
        return {"error": "Pair not found"}, 400
    

    rate = float(data[pair]["bid"])
    
    return {
        "from": from_curr,
        "to": to_curr,
        "rate": rate
    }
