from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine
from app import routes, models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Currency Intelligence Dasboard")

app.include_router(routes.router)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_index():
    return FileResponse("static/index.html")
