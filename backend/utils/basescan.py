import os
import requests
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()
BASESCAN_API_KEY = os.getenv("BASESCAN_API_KEY")

BASE_RPC = os.getenv("BASE_RPC", "https://mainnet.base.org")
w3 = Web3(Web3.HTTPProvider(BASE_RPC))

if not BASESCAN_API_KEY:
    raise ValueError("Missing BASESCAN_API_KEY")

def fetch_basescan(endpoint: str, wallet: str):
    url = (
        f"https://api.basescan.org/api"
        f"?module=account"
        f"&action={endpoint}"
        f"&address={wallet}"
        f"&startblock=0&endblock=99999999"
        f"&sort=asc"
        f"&apikey={BASESCAN_API_KEY}"
    )
    try:
        res = requests.get(url).json()
        if res.get("status") != "1":
            return []
        return res["result"]
    except Exception as e:
        print(f" BaseScan error for {endpoint}: {e}")
        return []

def fetch_eth(wallet: str):
    return fetch_basescan("txlist", wallet)

def fetch_erc20(wallet: str):
    return fetch_basescan("tokentx", wallet)

# Extensible: placeholder for NFT support
def fetch_erc721(wallet: str):
    return fetch_basescan("tokennfttx", wallet)  # Not needed now

def fetch_internal(wallet: str):
    return fetch_basescan("txlistinternal", wallet)  # Optional
