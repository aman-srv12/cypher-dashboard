from datetime import datetime
from web3 import Web3
from services.price_oracle import get_usd_price
from utils.constants import MASTER_WALLET, ETH_TOKEN
from utils.basescan import fetch_basescan

# Main function to compute load volume (daily/weekly/monthly)
def get_usd_volume(from_date: str = None, to_date: str = None):
    # Parse date range
    from_dt = datetime.strptime(from_date, "%Y-%m-%d") if from_date else None
    to_dt = datetime.strptime(to_date, "%Y-%m-%d") if to_date else None

    daily, weekly, monthly = {}, {}, {}
    price_cache = {}

    def add_volume(date_obj, usd_value):
        if from_dt and date_obj < from_dt:
            return
        if to_dt and date_obj > to_dt:
            return

        day = date_obj.strftime("%Y-%m-%d")
        week = date_obj.strftime("%Y-W%U")
        month = date_obj.strftime("%Y-%m")
        daily[day] = daily.get(day, 0) + usd_value
        weekly[week] = weekly.get(week, 0) + usd_value
        monthly[month] = monthly.get(month, 0) + usd_value

    print("Fetching ERC-20 and ETH transactions from BaseScan...")

    erc20_txs = fetch_basescan("tokentx", MASTER_WALLET)
    eth_txs = fetch_basescan("txlist", MASTER_WALLET)

    print(f"Fetched {len(erc20_txs)} ERC-20 transactions")
    print(f"Fetched {len(eth_txs)} ETH transactions")
    
    # erc20_txs = erc20_txs[:10]
    # eth_txs = eth_txs[:10]
    # print(erc20_txs)
    # print(eth_txs)

    for tx in erc20_txs:
        if tx.get("to", "").lower() != MASTER_WALLET:
            continue
        try:
            ts = datetime.utcfromtimestamp(int(tx["timeStamp"]))
            token_address = Web3.to_checksum_address(tx["contractAddress"])
            amount = int(tx["value"]) / (10 ** int(tx["tokenDecimal"]))
            block = int(tx["blockNumber"])
            key = (token_address, block)

            price = price_cache.get(key)
            if not price:
                price = get_usd_price(token_address, block)
                price_cache[key] = price

            usd = amount * price
            print(f"[ERC20] Block {block}: {amount:.4f} tokens → ${usd:.2f} on {ts.date()}")
            add_volume(ts, usd)
        except Exception as e:
            print(f"[ERC20] Skipped tx due to error: {e}")
            continue

    for tx in eth_txs:
        if tx.get("to", "").lower() != MASTER_WALLET:
            continue
        try:
            ts = datetime.utcfromtimestamp(int(tx["timeStamp"]))
            value_eth = int(tx["value"]) / 1e18
            block = int(tx["blockNumber"])
            key = (ETH_TOKEN, block)

            price = price_cache.get(key)
            if not price:
                price = get_usd_price(ETH_TOKEN, block)
                price_cache[key] = price

            usd = value_eth * price
            print(f"[ETH] Block {block}: {value_eth:.4f} ETH → ${usd:.2f} on {ts.date()}")
            add_volume(ts, usd)
        except Exception as e:
            print(f"[ETH] Skipped tx due to error: {e}")
            continue

    # Return only data that falls in the time range (already filtered in add_volume)
    return {
        "daily": [{"date": k, "usd": round(v, 2)} for k, v in sorted(daily.items())],
        "weekly": [{"week": k, "usd": round(v, 2)} for k, v in sorted(weekly.items())],
        "monthly": [{"month": k, "usd": round(v, 2)} for k, v in sorted(monthly.items())],
    }