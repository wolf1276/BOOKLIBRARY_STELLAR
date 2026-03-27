# 🔧 BookLibrary Stellar Backend

Express.js server that bridges the frontend dApp with the Stellar Soroban smart contract. Manages database, handles contract interactions, and provides real-time WebSocket updates.

## ✨ Features

- **⛓️ Smart Contract Bridge** — Seamless interaction with Soroban contract calls
- **💾 Data Persistence** — Prisma ORM with PostgreSQL/SQLite support
- **🔄 Real-Time Updates** — WebSocket server for live event notifications
- **📁 File Upload** — Multer integration for IPFS-bound assets
- **📊 Event Polling** — Automatic contract event monitoring
- **🔐 Rate Limiting** — Express rate limiter for API protection
- **📝 Logging** — Winston logger with structured outputs

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Prisma ORM (PostgreSQL/SQLite)
- **Blockchain:** Stellar SDK v12+
- **Real-Time:** WebSockets (ws)
- **File Upload:** Multer
- **Validation:** Zod
- **Logging:** Winston
- **Rate Limiting:** express-rate-limit

## 📁 Project Structure

```
backend/
├── index.js                 # Server entry point
├── routes/
│   ├── books.js            # Book CRUD endpoints
│   ├── contract.js         # Smart contract interaction
│   └── upload.js           # File upload handling
├── utils/
│   ├── stellar.js          # Stellar SDK utilities
│   └── polling.js          # Event polling logic
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL or SQLite
- Stellar testnet account (with funded key pair)
- Soroban contract deployed

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create `.env` file:

```env
# Server
PORT=4000
WS_PORT=4001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/booklibrary
# or for SQLite:
# DATABASE_URL=file:./prisma/dev.db

# Stellar
STELLAR_SECRET_KEY=SBZQYAQHQY...      # Your account's secret key
CONTRACT_ID=CA5PPYJ...                # Soroban contract address
STELLAR_NETWORK=testnet                # testnet or public

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional
LOG_LEVEL=debug
API_RATE_LIMIT=100                    # requests per 15 minutes
FILE_UPLOAD_SIZE=50mb
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create/migrate database
npm run db:migrate

# Push schema (development only)
npm run db:push

# Seed database (if seed script exists)
npm run db:seed
```

### Development

```bash
npm start
```

Server runs on:
- HTTP API: `http://localhost:4000`
- WebSocket: `ws://localhost:4001`

## 📦 API Endpoints

### Books

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/books` | Get all books | No |
| `POST` | `/api/books` | Register new book | Yes |
| `GET` | `/api/books/:id` | Get book by ID | No |
| `PUT` | `/api/books/:id` | Update book | Yes |
| `DELETE` | `/api/books/:id` | Delete book | Yes |
| `POST` | `/api/books/:id/borrow` | Borrow book | Yes |
| `POST` | `/api/books/:id/return` | Return book | Yes |

### Contract

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/contract/call` | Execute contract function |
| `GET` | `/api/contract/events` | Get contract events |
| `POST` | `/api/contract/balance` | Get account balance |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload file to IPFS |
| `GET` | `/api/upload/:hash` | Get uploaded file |

## 🔗 Request Examples

### Register a Book

```bash
curl -X POST http://localhost:4000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "ipfsHash": "QmXxxx...",
    "owner": "GXXX..."
  }'
```

### Borrow a Book

```bash
curl -X POST http://localhost:4000/api/books/1/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "borrower": "GXXX...",
    "depositAmount": "10"
  }'
```

### Call Contract Function

```bash
curl -X POST http://localhost:4000/api/contract/call \
  -H "Content-Type: application/json" \
  -d '{
    "method": "get_books",
    "args": []
  }'
```

## 🔄 WebSocket Events

Connect to `ws://localhost:4001`:

```javascript
const ws = new WebSocket('ws://localhost:4001');

ws.on('message', (data) => {
  const event = JSON.parse(data);
  // event: book_added, book_borrowed, book_returned, etc.
  console.log(event);
});
```

**Event Types:**
- `book_added` — New book registered
- `book_borrowed` — Book borrowed by user
- `book_returned` — Book returned by user
- `contract_event` — Raw contract event
- `sync_status` — Server sync status

## 📊 Database Schema

Key tables:

```prisma
model Book {
  id        Int     @id @default(autoincrement())
  title     String
  author    String
  owner     String  // Stellar address
  borrower  String? // Stellar address
  ipfsHash  String
  contractId String // On-chain ID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id        Int     @id @default(autoincrement())
  bookId    Int
  from      String  // Stellar address
  to        String  // Stellar address
  type      String  // borrow, return, register
  txHash    String  // Stellar transaction hash
  createdAt DateTime @default(now())
}

model Event {
  id        Int     @id @default(autoincrement())
  type      String
  bookId    Int?
  data      Json
  createdAt DateTime @default(now())
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Test endpoint manually
curl http://localhost:4000/api/books
```

## 🔒 Security Considerations

- **Rate Limiting:** Enabled on all routes (default 100 req/15min)
- **CORS:** Restricted to `CORS_ORIGIN` (configure in .env)
- **Secret Key:** Never commit `.env` file; keep STELLAR_SECRET_KEY secret
- **Input Validation:** Zod schema validation on all inputs
- **Error Handling:** Sensitive errors don't leak to client

## 🚀 Deployment

### Deploy to Railway

```bash
# Connect repository to Railway
# Railway will auto-detect Node.js

# Set environment variables in Railway dashboard:
# - DATABASE_URL
# - STELLAR_SECRET_KEY
# - CONTRACT_ID
# - etc.

# Railway auto-deploys on git push
```

### Deploy to Render

```bash
# Create new Web Service on Render
# Connect GitHub repository
# Set environment variables
# Deploy
```

### Deploy to AWS ECS

```bash
# Build Docker image
docker build -t booklibrary-backend .

# Push to ECR
aws ecr get-login-password | docker login ...
docker tag booklibrary-backend:latest ...
docker push ...

# Deploy with ECS/Fargate
```

## 📝 Environment Variables Reference

```env
# Server Configuration
PORT                    # HTTP server port (default: 4000)
WS_PORT                # WebSocket port (default: 4001)
NODE_ENV               # development, production, test

# Database
DATABASE_URL           # PostgreSQL: postgresql://user:pass@host/db
                       # SQLite: file:./prisma/dev.db

# Stellar Blockchain
STELLAR_SECRET_KEY     # Account secret key (starts with S)
CONTRACT_ID            # Soroban contract ID
STELLAR_NETWORK        # testnet or public

# API Configuration
CORS_ORIGIN            # Frontend origin (for CORS)
API_RATE_LIMIT         # Requests per 15 minutes
FILE_UPLOAD_SIZE       # Max file upload size

# Logging
LOG_LEVEL              # debug, info, warn, error
```

## 🐛 Troubleshooting

**Database connection fails:**
```bash
# Check DATABASE_URL format
# PostgreSQL: postgresql://user:password@localhost:5432/dbname
# Ensure database server is running
```

**Contract calls fail:**
```bash
# Verify STELLAR_SECRET_KEY is correct
# Check CONTRACT_ID exists on testnet
# Ensure account has enough XLM
```

**WebSocket not connecting:**
```bash
# Check WS_PORT is accessible (4001)
# Frontend should use: ws://localhost:4001
# In production: wss://yourdomain.com (use secure WebSocket)
```

**CORS errors:**
```bash
# Set CORS_ORIGIN to your frontend URL
# CORS_ORIGIN=https://yourdomain.com
```

## 📚 Resources

- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Stellar SDK Docs](https://developers.stellar.org/docs/build/applications)
- [Soroban Documentation](https://soroban.stellar.org/)
- [ws Library](https://github.com/websockets/ws)

## 📄 License

MIT License - See LICENSE file in root directory

## 🤝 Contributing

Contributions welcome! When submitting PRs:
- Follow existing code style
- Add error handling for edge cases
- Test all endpoints with sample data
- Update this README if adding new endpoints
- Keep database migrations clean
