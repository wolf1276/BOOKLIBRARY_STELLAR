# 📚 BookLibrary Stellar

**A decentralized, on-chain library management system built on Stellar Soroban.** Register, borrow, and manage books with blockchain-backed security and immutable records.

### 🚀 [Live dApp](https://booklibrary-stellar.vercel.app)

---

## ✨ Features

- **📖 Book Registration** — Register books on-chain with metadata and IPFS hashes
- **🔐 Wallet Integration** — Seamless Freighter wallet connection for authentication
- **⛓️ On-Chain Borrowing** — Borrow and return books with smart contract enforcement
- **💾 Permanent Records** — All transactions anchored on the Stellar testnet
- **🔄 Real-Time Updates** — WebSocket support for live library state changes
- **🎨 Modern UI** — Animated interface with Three.js visualization and smooth interactions

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, Three.js | Responsive dApp interface |
| **Backend** | Express.js, Prisma, PostgreSQL/SQLite | Contract bridge & data management |
| **Smart Contract** | Rust, Soroban SDK | On-chain book logic |
| **Blockchain** | Stellar Soroban (Testnet) | Immutable book records |
| **Wallet** | Freighter API | User authentication |

## 📁 Project Structure

```
.
├── contracts/
│   └── book-library/              # Smart contract (Rust + Soroban)
│       ├── src/
│       │   ├── lib.rs             # Core contract logic
│       │   └── test.rs            # Contract unit tests
│       └── Cargo.toml
│
├── backend/                       # Express.js API server
│   ├── routes/
│   │   ├── books.js              # Book endpoints
│   │   ├── contract.js           # Smart contract bridge
│   │   └── upload.js             # File upload handling
│   ├── utils/
│   │   ├── stellar.js            # Stellar SDK utilities
│   │   └── polling.js            # Event polling
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── index.js                  # Server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                      # Next.js 14 dApp
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── library/          # Library view
│   │   │   ├── book/[id]/        # Book details
│   │   │   ├── dashboard/        # User dashboard
│   │   │   └── upload/           # Book upload
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Client utilities
│   ├── package.json
│   └── tailwind.config.ts
│
├── Cargo.toml                    # Workspace config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm/yarn
- Rust 1.70+
- Soroban CLI
- Freighter wallet extension

### Installation

```bash
# Clone repository
git clone <repository-url>
cd BOOKLIBRARY_STELLAR

# Install all dependencies
npm install              # Frontend
cd backend && npm install && cd ..
cd contracts/book-library && cargo build && cd ../..
```

### Configuration

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/booklibrary
STELLAR_SECRET_KEY=your-stellar-private-key
CONTRACT_ID=your-soroban-contract-id
PORT=4000
WS_PORT=4001
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4001
NEXT_PUBLIC_CONTRACT_ID=your-contract-id
NEXT_PUBLIC_NETWORK=testnet
```

### Development

```bash
# Terminal 1: Start backend
cd backend
npm run db:push           # Set up database
npm start                 # Port 4000

# Terminal 2: Start frontend
cd frontend
npm run dev               # Port 3000

# Terminal 3: Deploy/build contract (optional)
cd contracts/book-library
soroban contract build
cargo test -p book-library
```

Visit `http://localhost:3000` in your browser.

## 📦 Smart Contract

The Soroban smart contract manages:
- Book metadata storage
- Borrowing mechanics and deposit system
- Access control for operations
- Event emission for tracking changes

**Core Functions:**
- `initialize()` — Set up contract with admin and token
- `add_book()` — Register a new book
- `borrow_book()` — Borrow a book (requires deposit)
- `return_book()` — Return borrowed book (refund deposit)
- `get_books()` — Fetch all books

## 🔗 Deployment

### Smart Contract
```bash
cd contracts/book-library
soroban contract build --release
soroban contract deploy \
  --source <account-id> \
  --wasm target/wasm32-unknown-unknown/release/book_library.wasm
```

### Frontend
The frontend is deployed on Vercel. Push to `main` branch to auto-deploy.

```bash
# Build locally
cd frontend
npm run build
npm run start
```

### Backend
Deploy to your preferred platform (Railway, Render, AWS, etc.):

```bash
# Build & deploy
cd backend
npm run db:migrate
npm run build  # or npm start
```

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/books` | Fetch all books |
| `POST` | `/api/books` | Register new book |
| `GET` | `/api/books/:id` | Get book details |
| `POST` | `/api/books/:id/borrow` | Borrow book |
| `POST` | `/api/books/:id/return` | Return book |
| `POST` | `/api/contract/call` | Execute contract function |
| `POST` | `/api/upload` | Upload file to IPFS |

## 🧪 Testing

```bash
# Test smart contract
cd contracts/book-library
cargo test

# Test backend (when implemented)
cd ../../backend
npm test

# Test frontend (when implemented)
cd ../frontend
npm test
```

## 🐛 Troubleshooting

**WebSocket connection fails:**
- Ensure backend WS_PORT (4001) is accessible
- Check CORS settings in backend

**Contract not found:**
- Verify CONTRACT_ID environment variable
- Ensure contract is deployed to the same network

**Wallet connection issues:**
- Install Freighter extension
- Switch to Testnet in Freighter
- Clear browser cache if needed

## 📖 Documentation

- [Stellar Soroban Docs](https://soroban.stellar.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Freighter Wallet API](https://developers.stellar.org/docs/building-apps/wallet/freighter)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow best practices and open a PR with a clear description of changes.
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
