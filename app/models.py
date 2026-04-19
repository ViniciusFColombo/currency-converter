from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.database import Base

class CurrencyHistory(Base):
    __tablename__ = "currency_history"

    id = Column(Integer, primary_key=True, index=True)
    currency_code = Column(String)
    rate = Column(Float)
    extracted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))