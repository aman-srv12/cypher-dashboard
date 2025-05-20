from web3 import Web3
from decimal import Decimal
import os
import time
import requests
from web3.exceptions import ContractLogicError
from utils.constants import AERODROME_FACTORY, USDC, ETH_TOKEN

# Connect to Base chain
WEB3_PROVIDER = os.getenv("BASE_RPC", "https://mainnet.base.org")
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
print("Using Base RPC:", WEB3_PROVIDER)

# Use simulated pricing? Toggle with env variable
USE_SIMULATED_PRICING = os.getenv("SIMULATE_PRICES", "true").lower() == "true"
print("Using simulated pricing:", USE_SIMULATED_PRICING)

# Aerodrome factory ABI
AERODROME_V3_FACTORY_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "tokenA", "type": "address"},
            {"internalType": "address", "name": "tokenB", "type": "address"},
            {"internalType": "uint24", "name": "fee", "type": "uint24"}
        ],
        "name": "getPool",
        "outputs": [{"internalType": "address", "name": "pool", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Pool oracle ABI (Uniswap V3 `observe`)
UNISWAP_V3_ORACLE_ABI = [
    {
        "inputs": [{"internalType": "uint32[]", "name": "secondsAgos", "type": "uint32[]"}],
        "name": "observe",
        "outputs": [
            {"internalType": "int56[]", "name": "tickCumulatives", "type": "int56[]"},
            {"internalType": "uint160[]", "name": "secondsPerLiquidityCumulativeX128s", "type": "uint160[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

# Converts tick to price (Uniswap formula)
def tick_to_price(tick: int) -> float:
    return float(Decimal("1.0001") ** tick)

# Retry wrapper with exponential backoff
def with_retry(callable_fn, max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            return callable_fn()
        except (requests.exceptions.RequestException, ContractLogicError) as e:
            if attempt < max_retries - 1:
                time.sleep(delay * (2 ** attempt))
            else:
                raise

# Tries to find Aerodrome pool address for given token
def get_aerodrome_pool(token_address: str, fee_tiers=(500, )) -> str:
    token_address = Web3.to_checksum_address(token_address)
    factory = w3.eth.contract(address=AERODROME_FACTORY, abi=AERODROME_V3_FACTORY_ABI)

    for fee in fee_tiers:
        tokenA, tokenB = sorted([token_address, USDC])
        print(f"Calling getPool with tokenA={tokenA}, tokenB={tokenB}, fee={fee}")
        try:
            pool_address = factory.functions.getPool(tokenA, tokenB, fee).call()
            if pool_address and pool_address != "0x0000000000000000000000000000000000000000":
                return pool_address
        except Exception as e:
            print(f"[POOL] Failed to get pool at fee {fee}: {e}")
            continue

    print(f"[POOL] No valid Aerodrome pool found for {token_address}")
    return "0x0000000000000000000000000000000000000000"

# Main function to fetch USD price for a token at a given block
def get_usd_price(token_address: str, block_number: int, twap_secs: int = 3600) -> float:
    token_address = Web3.to_checksum_address(token_address)

    # Simulated fallback prices
    SIMULATED_PRICES = {
        ETH_TOKEN.lower(): 3000.0,
        USDC.lower(): 1.0,
        "0x5263fc91c134c7d19fdbf8804a1218e1bc9729e1": 0.25,  # wENA
    }

    if USE_SIMULATED_PRICING:
        fallback = SIMULATED_PRICES.get(token_address.lower(), 1.0)
        print(f"[PRICE] Simulated price for {token_address}: ${fallback:.2f}")
        return fallback

    try:
        pool_address = get_aerodrome_pool(token_address)
        if not pool_address or pool_address == "0x0000000000000000000000000000000000000000":
            raise Exception("No Aerodrome pool found")

        pool = w3.eth.contract(address=Web3.to_checksum_address(pool_address), abi=UNISWAP_V3_ORACLE_ABI)
        seconds_agos = [twap_secs, 0]

        result = with_retry(lambda: pool.functions.observe(seconds_agos).call(block_identifier=block_number))
        if not isinstance(result, (list, tuple)) or len(result) != 2:
            raise Exception("observe() did not return expected 2-tuple")

        tick_cumulatives, _ = result
        tick_avg = (tick_cumulatives[1] - tick_cumulatives[0]) // twap_secs
        price = tick_to_price(tick_avg)
        print(f"[PRICE] Real price from Aerodrome: ${price:.4f}")
        return price

    except Exception as e:
        fallback = SIMULATED_PRICES.get(token_address.lower(), 1.0)
        print(f"[PRICE] Simulated price for {token_address}: ${fallback:.2f} — Reason: {e}")
        return fallback