from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import fetch_currency_data
from app.models import CurrencyHistory
from typing import List

router = APIRouter()

@router.get("/prices")
def get_prices(db: Session = Depends(get_db)):
    data = fetch_currency_data()

    euro_rate = float(data["EURBRL"]["bid"])
    new_entry = CurrencyHistory(
        currency_code="EUR",
        rate =euro_rate
    )

    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return{
        "currency": "EUR/BRL",
        "rate": euro_rate,
        "status": "Saved to PostgreSQL",
        "timestamp": new_entry.extracted_at
    }

@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    history = db.query(CurrencyHistory).order_by(CurrencyHistory.extracted_at.desc()).all()
    return history