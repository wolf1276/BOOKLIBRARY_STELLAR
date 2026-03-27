# 🚀 Backend to Vercel Migration Guide

This guide explains how to migrate your BookLibrary project from a separate Express backend to Vercel's serverless API routes.

## ✅ What's Changed

### Before
```
booklibrary/
├── frontend/  (Next.js on Vercel)
├── backend/   (Express.js on separate server)
└── contracts/ (Smart contract)

API calls: frontend → backend.rendercom:4000
```

### After
```
booklibrary/
├── frontend/  (Next.js on Vercel - includes API routes)
├── backend/   (DEPRECATED - can be deleted)
└── contracts/ (Smart contract)

API calls: frontend → vercel-domain.com/api (same-origin)
```

## 📋 Migration Steps

### 1️⃣ Install Dependencies

The frontend now needs Prisma to access the database:

```bash
cd frontend
npm install
# This installs @prisma/client, prisma, and zod from updated package.json
```

### 2️⃣ Setup Environment Variables

Create `.env.local` in the frontend directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@region.neon.tech:5432/booklibrary?sslmode=require

# Stellar Configuration (Required for contract calls)
STELLAR_SECRET_KEY=SBXXXXXXXXXXXXXXXXXXXXXX
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM

# Public Variables (visible in browser)
NEXT_PUBLIC_CONTRACT_ID=CBYNK3NUXBOEWLQQHACBMTH7JLHV4PSNJ22VPSHK77MCZZZZOSC3PBJM
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_API_URL=          # Leave empty for same-origin (/api)
NEXT_PUBLIC_NETWORK=testnet
```

### 3️⃣ Generate Prisma Client

```bash
cd frontend
npx prisma generate
```

This creates the Prisma client from your schema.

### 4️⃣ Update Database Schema (if needed)

If your database is missing the new `description` field, run a migration:

```bash
# For development
npx prisma db push

# For production (create migration)
npx prisma migrate dev --name add_description_field
```

### 5️⃣ Deploy to Vercel

Push your changes to GitHub, and Vercel will auto-deploy:

```bash
git add .
git commit -m "Migrate backend to Vercel API routes"
git push origin main
```

Then in Vercel dashboard, set environment variables:

**Settings → Environment Variables:**

- `DATABASE_URL` = your Neon PostgreSQL URL
- `STELLAR_SECRET_KEY` = your Stellar secret key
- `CONTRACT_ID` = your contract ID
- `STELLAR_RPC_URL` = https://soroban-testnet.stellar.org
- (All other `NEXT_PUBLIC_*` vars are handled via code/package.json)

### 6️⃣ Verify Deployment

After deploying, test the API routes:

```bash
# Replace with your Vercel domain
curl https://yourdomain.vercel.app/api/books
curl https://yourdomain.vercel.app/api/contract/info
```

## 🔌 API Routes Created

All routes are now serverless functions in `/frontend/src/app/api/`:

### Books
- `GET  /api/books` — Fetch all books
- `POST /api/books` — Upload/register new book
- `GET  /api/books/[id]` — Fetch single book
- `GET  /api/books/[id]?verify=true` — Verify book on-chain

### Contract
- `GET  /api/contract/info` — Contract metadata
- `GET  /api/contract/book/[id]` — Query book from contract
- `POST /api/contract/borrow` — Borrow book
- `POST /api/contract/return` — Return book
- `POST /api/contract/prepare` — Prepare tx for wallet signing
- `POST /api/contract/invoke` — General invocation

## 📂 New Frontend Files

```
frontend/
├── src/
│   ├── lib/
│   │   ├── prisma.ts          ← Singleton Prisma client
│   │   └── stellar.ts         ← Stellar SDK utilities (migrated from backend)
│   └── app/
│       ├── api/
│       │   ├── books/
│       │   │   ├── route.ts            ← GET all, POST upload
│       │   │   └── [id]/route.ts       ← GET single, verify
│       │   └── contract/
│       │       ├── info/route.ts
│       │       ├── book/[id]/route.ts
│       │       ├── borrow/route.ts
│       │       ├── return/route.ts
│       │       ├── prepare/route.ts
│       │       └── invoke/route.ts
│       └── hooks/
│           └── useContractBooks.ts    ← Updated to use /api
├── .env.local.example         ← Environment template
└── prisma/
    └── schema.prisma          ← Database schema (NEW)
```

## 🗑️ What to Delete

Once verified working on Vercel, you can delete:

```bash
rm -rf backend/          # Express server no longer needed
```

The backend folder is obsolete because all API endpoints are now Vercel functions.

## 🔍 How API Calls Work Now

### Before (Express)
```javascript
// API called external backend server
fetch('http://backend-server:4000/api/books')
```

### After (Vercel)
```javascript
// API calls are same-origin (same domain)
fetch('/api/books')  // Automatically routes to Vercel edge functions
```

### Development (localhost)
```bash
npm run dev
# Frontend: http://localhost:3000
# API: http://localhost:3000/api/* (same-origin)
```

### Production (Vercel)
```bash
# Frontend: https://myapp.vercel.app
# API: https://myapp.vercel.app/api/* (same-origin)
```

## ⚠️ Differences from Backend

1. **Cold Starts**: Serverless functions may have slight cold start latency (500ms-1s on first request after idle)
2. **Timeouts**: Vercel timeout is 60s (free) or 900s (pro) vs unlimited for long-running Express
3. **WebSockets**: Not supported by Vercel functions (polling still works)
4. **File Uploads**: Limited to request size (4.5MB on free, 32MB on pro)

## 🆘 Troubleshooting

### "DATABASE_URL is not set"
- Check `.env.local` exists and has `DATABASE_URL`
- Verify Neon PostgreSQL URL is correct
- Restart dev server after editing `.env.local`

### "STELLAR_SECRET_KEY is required"
- Check `.env.local` has `STELLAR_SECRET_KEY`
- Ensure it starts with `S` (Stellar secret format)
- Never commit `.env.local` to git

### API route returns 404
- Ensure file is in correct path: `app/api/[route]/route.ts`
- Next.js file-based routing is strict about naming
- Restart dev server after adding new routes

### Book upload fails
- Check database connection: `DATABASE_URL` is valid
- Verify contract is deployed and `CONTRACT_ID` is correct
- Check Stellar account has XLM for operations

### "no protocol" error after deploy
- In Vercel environment, set `NEXT_PUBLIC_API_URL` to empty string
- This tells frontend to use same-origin requests (relative `/api` paths)

## 📊 Database Migrations

If you added the `description` field:

```bash
# Create and run migration
npx prisma migrate dev --name add_book_description

# Or just push schema changes (development only)
npx prisma db push
```

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all API endpoints
3. ✅ Verify books can be uploaded and fetched
4. ✅ Test contract interactions (borrow/return)
5. Delete `backend/` folder from git (keep archive copy locally if needed)
6. Update project documentation

## 📝 Environment Variables Reference

| Variable | Where | Required | Example |
|----------|-------|----------|---------|
| `DATABASE_URL` | `.env.local` | ✅ | `postgresql://...@neon.tech/db?sslmode=require` |
| `STELLAR_SECRET_KEY` | `.env.local` | ✅ | `SBXXXXXX...` |
| `STELLAR_RPC_URL` | `.env.local` | ❌ | `https://soroban-testnet.stellar.org` |
| `CONTRACT_ID` | `.env.local` | ✅ | `CA5P...` |
| `NEXT_PUBLIC_CONTRACT_ID` | Code/env | ✅ | `CA5P...` |
| `NEXT_PUBLIC_STELLAR_RPC_URL` | Code/env | ❌ | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_API_URL` | Vercel env | ❌ | Leave empty for prod |
| `NEXT_PUBLIC_NETWORK` | Code | ❌ | `testnet` |

---

**Questions?** Check the individual API route files in `frontend/src/app/api/` for implementation details.
