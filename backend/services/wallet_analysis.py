from web3 import Web3
import os
from utils.basescan import fetch_eth, fetch_erc20
from utils.labels import KNOWN_LABELS

WEB3_PROVIDER = os.getenv("BASE_RPC", "https://mainnet.base.org")
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))

def analyze_wallet(address: str):
    print(f"\n Analyzing wallet: {address}\n")

    # Fetch all transactions (ETH and ERC20)
    eth_txs = fetch_eth(address)
    erc20_txs = fetch_erc20(address)
    all_txs = eth_txs + erc20_txs

    print(f"Total transactions fetched: {len(all_txs)} (ETH: {len(eth_txs)}, ERC20: {len(erc20_txs)})")

    # Count transactions per counterparty
    counterparties = {}

    for tx in all_txs:
        from_addr = tx.get('from', '').lower()
        to_addr = tx.get('to', '').lower()

        if from_addr == address.lower():
            counterparty = to_addr
        else:
            counterparty = from_addr

        if not counterparty:
            print(f"Skipping transaction with missing counterparty: {tx.get('hash')}")
            continue

        if counterparty not in counterparties:
            label = KNOWN_LABELS.get(counterparty, 'Unknown')
            counterparties[counterparty] = {
                'tx_count': 0,
                'last_tx': tx,
                'label': label
            }
            # print(f" New counterparty found: {counterparty} ({label})")

        counterparties[counterparty]['tx_count'] += 1

    print(f"Found {len(counterparties)} unique counterparties")

    # Classify each counterparty
    results = []
    for cp, data in counterparties.items():
        try:
            checksum = Web3.to_checksum_address(cp)
            code = w3.eth.get_code(checksum)
            is_contract = code != b''

            # print(f"Analyzing counterparty: {cp}")
            # print(f"   ↳ Type: {'contract' if is_contract else 'wallet'}, Tx Count: {data['tx_count']}, Label: {data['label']}")

            results.append({
                'address': cp,
                'tx_count': data['tx_count'],
                'type': 'contract' if is_contract else 'wallet',
                'label': data['label'],
                'last_interaction': data['last_tx'].get('timeStamp'),
                'last_tx_hash': data['last_tx'].get('hash')
            })
        except Exception as e:
            print(f" Error analyzing {cp}: {e}")
            continue

    top_results = sorted(results, key=lambda x: x['tx_count'], reverse=True)[:10]
    print(f"\n Returning top {len(top_results)} counterparties\n")
    return top_results