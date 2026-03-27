# BookLibrary Stellar - Vercel Deployment Setup

## 🎯 Quick Deployment Steps

### 1. Local Setup

```bash
# Install dependencies
cd frontend
npm install

# Generate Prisma client
npx prisma generate

# Setup environment (copy template)
cp .env.local.example .env.local

# Edit .env.local with your values:
# - DATABASE_URL (Neon PostgreSQL)
# - STELLAR_SECRET_KEY
# - CONTRACT_ID
```

### 2. Test Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### 3. Push to GitHub

```bash
git add .
git commit -m "Migrate to Vercel API routes"
git push origin main
```

### 4. Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. In Settings → Environment Variables, add:
   - `DATABASE_URL` = your Neon URL
   - `STELLAR_SECRET_KEY` = your secret key
   - `CONTRACT_ID` = your contract ID
   - `STELLAR_RPC_URL` = https://soroban-testnet.stellar.org
4. Deploy!

### 5. Verify

```bash
curl https://yourdomain.vercel.app/api/books
curl https://yourdomain.vercel.app/api/contract/info
```

## 📖 Key Changes from Backend

| Aspect | Before | After |
|--------|--------|-------|
| Server | Express.js (separate) | Vercel Functions (integrated) |
| Database | Neon PostgreSQL | Neon PostgreSQL (same) |
| API URLs | `backend:4000/api/*` | `vercel-domain.vercel.app/api/*` |
| Deployment | Manual host setup | Auto-deploy on git push |
| Scaling | Manual | Automatic (serverless) |

## 📦 What's Included

✅ 7 API route files (books, contract operations)  
✅ Prisma ORM client configuration  
✅ Stellar SDK integration  
✅ Environment variables setup guide  
✅ Updated frontend components  

## 🗂️ File Structure

```
frontend/
├── src/app/api/              ← NEW: Serverless functions
│   ├── books/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── contract/
│       ├── info/route.ts
│       ├── book/[id]/route.ts
│       ├── borrow/route.ts
│       ├── return/route.ts
│       ├── prepare/route.ts
│       └── invoke/route.ts
├── src/lib/                 ← NEW: Shared utilities
│   ├── prisma.ts
│   └── stellar.ts
├── prisma/                  ← NEW: Database schema
│   └── schema.prisma
└── .env.local.example       ← NEW: Env template
```

## 🚀 No More Backend Server Needed!

The `backend/` folder is **no longer necessary** after migration. All endpoints are now serverless functions on Vercel.

## ⚡ Performance Notes

- **Same-origin API**: Frontend and API on same domain → faster, no CORS issues
- **Serverless**: Automatic scaling, pay-per-use
- **Database**: Direct connection from functions → no middleware overhead

## 📚 Detailed Documentation

See `MIGRATION_GUIDE.md` for complete step-by-step instructions.

---

**Ready to deploy?** Follow the Quick Deployment Steps above!
