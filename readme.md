Here’s a cleaned-up, professional rewrite of your `README.md` while keeping it clear and developer-friendly:

---

# Volume Trading Bot for EVM Chains

## Overview

This bot is designed to simulate trading activity (volume generation) on any **EVM-compatible chain**, including:

* Binance Smart Chain (BSC)
* Ethereum Mainnet
* Base Chain
* Other EVM networks

It automates wallet creation, funding, randomized buy/sell operations, and optional fund gathering.

---

## Technology Stack

* **Languages:** TypeScript, Solidity
* **Type:** Automated Trading Bot Script

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your wallet information:

```env
ETH_BASE_WALLET_ADDRESS="Your wallet address"
ETH_BASE_WALLET_PRIVATE_KEY="Your wallet private key"
```

> **Note:** Default RPC endpoints in `.env` are public/free. For better performance, replace them with your own reliable endpoints.

---

### 3. Configure Bot Settings

Open `config.json` and adjust the parameters as needed:

```typescript
// Randomized trade amounts
export const amountMax = 0.003; // Maximum trade amount in ETH/BNB
export const amountMin = 0.001; // Minimum trade amount (must be > 0.001)

// Minimum fee balance to keep in wallet
export const fee = 0.001; // Recommended: ≥ 0.01 for more reliable transactions

// Randomized trade intervals (milliseconds)
export const maxInterval = 30000;
export const minInterval = 5000;

// Number of generated sub-wallets
export const subWalletNum = 20;

// Target blockchain
export const CHAINID: ChainId = ChainId.BSC;
```

💡 **Example Calculation**:
If `amountMax = 0.03` and `fee = 0.005` with `subWalletNum = 20`, your base wallet should have:

```
(0.03 + 0.005) × 20 = 0.7 ETH/BNB
```

> Using a higher fee value (e.g., 0.01) can help recover funds in case of transaction errors.

---

## Running the Bot

Once configured:

```bash
npm run dev
```

During execution, a JSON file will be generated to store all generated wallet addresses. You can use this to withdraw funds manually if needed.
(An automatic fund-gathering feature can be added upon request.)

---

## Features

* Randomized sub-wallet generation
* Automated funding of trading wallets
* Randomized buy/sell operations to simulate real market activity
* Optional manual or automatic fund gathering

---

## Example Transactions

* [BSC Tx 1](https://bscscan.com/tx/0x581cda788080b52fbd5db8c4d3500c22a6c136a07b73e2311d1fc29330d48fe5)
* [BSC Tx 2](https://bscscan.com/tx/0x8c870cf1721c2c765b45d2b13731bf384ec2e8020552aafb0436c01ded98f2ab)
* [BSC Tx 3](https://bscscan.com/tx/0xb46d289c48d04dc6cc74849ecd9ef4fff6bf86aa3b16fc231d019b82c7789bc2)

---

## Planned Improvements

* Further randomization of trade amounts
* Randomized trade frequency (buy/sell patterns)
* Support for multiple liquidity pools

---

## Contact

* **Telegram:** [@midaBricoll](https://t.me/m4rcu5sol)
* **Twitter/X:** [@dieharye](https://x.com/Pup5ol)

---
