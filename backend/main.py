from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.services.volume_aggregator import get_usd_volume
from backend.services.wallet_analysis import analyze_wallet

# Initialize FastAPI app
app = FastAPI()

# Allow requests from your deployed frontend
origins = [
    "https://cypher-dashboard-5jvl.vercel.app",
    "http://localhost:3000"  # Optional: helpful for local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # or use ["*"] for all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "backend up"}

# --- USD Load Volume Aggregation ---
@app.get("/load-volume")
def load_volume(from_date: str = None, to_date: str = None):
    """
    Returns daily/weekly/monthly USD volume of tokens sent to the master wallet.
    Pulls ERC-20 + ETH transfers only.
    """
    return get_usd_volume(from_date=from_date, to_date=to_date)

# --- Wallet Counterparty Analysis ---
@app.get("/wallet-analysis")
def wallet_analysis(address: str = Query(..., description="Wallet address to analyze")):
    """
    Returns top counterparties (by tx count) for a given wallet.
    Includes classification (CEX, smart contract, etc.).
    """
    return analyze_wallet(address)