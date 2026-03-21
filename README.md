# 📚 BookLibrary Stellar

**The first decentralized, on-chain library management system built on Stellar Soroban.** Securely register, verify, and browse books with blockchain-backed integrity.

![website preview](image.png)
![Book Library Preview](screenshot.png)

### 🚀 [Live dApp Demo](https://booklibrary-stellar.vercel.app)
### 🎥 [Watch the Video Demo](https://youtu.be/example-demo-link)

---

## 🛠️ Revisions & Updates
- **[CLEANUP]** Removed the redundant `hello-world` smartcontract folder.
- **[INTEGRATION]** Added full smartcontract integration logic across frontend and backend.
- **[DYNAMIC DATA]** Removed all hardcoded book data; records are now fetched directly from the Stellar Soroban contract via a backend bridge and Freighter wallet.

## 🌟 Features
- **Registration**: Allows users to register new books into the system with an IPFS hash.
- **On-Chain Verification**: Every book record is anchored on the Stellar network for immutable proof of existence.
- **Persistent Storage**: Book data is stored securely in the Stellar network's instance storage.
- **Freighter Wallet Integration**: Users can connect their Freighter wallet to interact with the contract.

## 🏗️ Project Structure
```text
.
├── contracts
│   └── book-library         # Main Soroban Smart Contract
│       ├── src
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
├── frontend                 # Next.js 14 dApp with TailwindCSS
├── backend                  # Express.js bridge for contract interaction
├── Cargo.toml
└── README.md
```

## 🔗 Deployed Smart Contract
https://lab.stellar.org/r/testnet/contract/CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM

## 🚀 How to Run Locally

### 1. Smart Contract
```bash
cargo test -p book-library
soroban contract build
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---
*Developed as part of the Stellar Soroban ecosystem.*
