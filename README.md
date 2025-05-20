# 💳 Cypher Load & Wallet Analytics Dashboard

A blockchain analytics dashboard for visualizing crypto card load activity and wallet interactions on the Base chain.

## 🚀 Overview

This web app provides:

1. 📊 **USD Load Volume Dashboard** – Aggregates total USD volume loaded into Cypher's master wallet daily, weekly, and monthly (2025 only).
2. 🧾 **Wallet Analysis Dashboard** – Displays the top 10 counterparties for any wallet address, enriched with metadata to identify protocols, contracts, and known exchanges.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, React Router
- **Backend / Scripting**: Python, Web3.py
- **Blockchain**: Base Chain (EVM-compatible)
- **DEX Price Source**: Aerodrome Finance (Uniswap v3-like pools)
- **Infrastructure**: Alchemy Base RPC
- **Caching**: In-memory or Redis (optional)

## 📦 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/aman-srv12/cypher-dashboard.git
cd cypher-dashboard