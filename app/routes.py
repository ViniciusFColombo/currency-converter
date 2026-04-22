from fastapi import APIRouter
from app.services import fetch_currency_data
import requests

router = APIRouter()

@router.get("/prices")
def get_prices(from_curr: str = "EUR", to_curr: str = "BRL"):
    data = fetch_currency_data()
    pair = f"{from_curr}{to_curr}"

    if not data or pair not in data:
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

        if isinstance(data, list):
            return data[::-1]
        
        pair_clean = pair.replace("-", "")
        if isinstance(data, dict) and pair_clean in data:
            return data[pair_clean][::-1]

        return []

    except Exception as e:
        print(f"Erro no fetch de histórico: {e}")
        return []