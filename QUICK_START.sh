#!/bin/bash
# Quick start script for Vercel migration
# Run this in the root directory: bash QUICK_START.sh

set -e

echo "🚀 BookLibrary Stellar - Vercel Migration Quick Start"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Navigate to frontend
cd frontend

echo "1️⃣  Installing dependencies..."
npm install

echo ""
echo "2️⃣  Generating Prisma client..."
npx prisma generate

echo ""
echo "3️⃣  Setting up environment variables..."
if [ -f .env.local ]; then
    echo "   ℹ️  .env.local already exists"
else
    if [ -f .env.local.example ]; then
        cp .env.local.example .env.local
        echo "   ✅ Created .env.local from template"
        echo ""
        echo "   📝 IMPORTANT: Edit .env.local with your values:"
        echo "      - DATABASE_URL (Neon PostgreSQL)"
        echo "      - STELLAR_SECRET_KEY"
        echo "      - CONTRACT_ID"
    fi
fi

echo ""
echo "4️⃣  Testing local development..."
echo "   Run: npm run dev"
echo "   Then visit: http://localhost:3000"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Edit frontend/.env.local with your database/Stellar credentials"
echo "   2. Run 'npm run dev' to test locally"
echo "   3. Push to GitHub and deploy on Vercel"
echo "   4. Set environment variables in Vercel dashboard"
echo ""
echo "📖 See MIGRATION_GUIDE.md for detailed instructions"
echo ""
