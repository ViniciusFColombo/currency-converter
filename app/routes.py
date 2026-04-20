from fastapi import APIRouter
from app.services import fetch_currency_data
import requests


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

@router.get("/history/{from_curr}/{to_curr}")
async def get_currency_history(from_curr: str, to_curr: str):
    pair = f"{from_curr}-{to_curr}"
    url = f"https://economia.awesomeapi.com.br/json/daily/{pair}/7"

    try:
        response = requests.get(url)
        data = response.json()
        return data[::-1]
    except Exception as e:
        return {"error": str(e)}