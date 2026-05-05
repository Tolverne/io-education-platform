from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

app = FastAPI(title="IO Education API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to Amplify URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "io-education-api"}

@app.get("/version")
def version():
    return {"version": "0.1.0", "runtime": "lambda"}

handler = Mangum(app)