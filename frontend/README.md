# 🎨 BookLibrary Stellar Frontend

Modern, animated Next.js 14 dApp for interacting with the BookLibrary Stellar smart contract.

## ✨ Features

- **⛓️ Blockchain Integration** — Connect with Freighter wallet & interact with Soroban contract
- **🎬 Smooth Animations** — Framer Motion & GSAP for beautiful page transitions
- **🌌 3D Visualization** — React Three Fiber with Three.js for immersive effects
- **📱 Responsive Design** — Mobile-first TailwindCSS architecture
- **🔄 Real-Time Updates** — WebSocket integration for live library state
- **🎣 Custom Hooks** — Reusable hooks for contract interaction and data fetching

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + PostCSS
- **3D Graphics:** Three.js, React Three Fiber, Drei
- **Animation:** Framer Motion, GSAP, Lottie
- **Blockchain:** Stellar SDK, Freighter API
- **Real-Time:** WebSockets
- **Smooth Scroll:** Lenis

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── book/
│   │   └── [id]/
│   │       └── page.tsx         # Book details page
│   ├── library/
│   │   └── page.tsx             # Browse all books
│   ├── dashboard/
│   │   └── page.tsx             # User dashboard
│   ├── upload/
│   │   └── page.tsx             # Upload new book
│   └── fonts/                   # Custom fonts
│
├── components/
│   ├── AnimatedHero.tsx         # Homepage hero section
│   ├── BookCard.tsx             # Book listing card
│   ├── FloatingBookGrid.tsx     # 3D book grid
│   ├── Navbar.tsx               # Navigation bar
│   ├── ParticleBackground.tsx   # Particle effects
│   ├── SmoothScrollProvider.tsx # Lenis scroll provider
│   ├── UploadModal.tsx          # Upload modal dialog
│   ├── VerificationBadge.tsx    # On-chain verification badge
│   └── WalletConnect.tsx        # Freighter wallet connector
│
├── hooks/
│   ├── useContractBooks.ts      # Smart contract book queries
│   └── useWebSocket.ts          # WebSocket connection hook
│
└── utils/
    └── stellar.ts              # Stellar SDK utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Freighter wallet extension installed

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env.local` in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4001
NEXT_PUBLIC_CONTRACT_ID=your-soroban-contract-id-here
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The application will automatically update as you edit files.

## 📦 Build & Deploy

### Build
```bash
npm run build
npm run start
```

### Deploy to Vercel

```bash
# The easiest way - connect your GitHub repo to Vercel
# Push to main branch and Vercel auto-deploys

# Or manually: 
vercel
```

## 🎯 Key Features

### 1. **Wallet Connection**
Connect your Stellar account via Freighter wallet:
```tsx
import WalletConnect from '@/components/WalletConnect';

export default function Home() {
  return <WalletConnect />;
}
```

### 2. **Fetch Books from Contract**
```tsx
import { useContractBooks } from '@/hooks/useContractBooks';

export default function Library() {
  const { books, loading, error } = useContractBooks();
  
  return (
    <div>
      {books.map(book => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
```

### 3. **Real-Time Updates**
```tsx
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Dashboard() {
  const { data } = useWebSocket(process.env.NEXT_PUBLIC_WS_URL);
  // Component auto-updates when server sends events
}
```

### 4. **3D Visualization**
```tsx
import FloatingBookGrid from '@/components/FloatingBookGrid';

export default function Hero() {
  return <FloatingBookGrid books={books} />;
}
```

## 🧪 Testing

To test contract interactions locally:

1. Start backend on `http://localhost:4000`
2. Start frontend on `http://localhost:3000`
3. Install Freighter and switch to Testnet
4. Try connecting wallet and interacting with books

## 📄 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero section |
| Library | `/library` | Browse all books in the system |
| Book Details | `/book/[id]` | View specific book & borrow/return |
| Dashboard | `/dashboard` | User's borrowed books & activity |
| Upload | `/upload` | Register new book on-chain |

## 🐛 Common Issues

**Wallet not connecting:**
- Ensure Freighter is installed and enabled
- Switch network to Testnet in Freighter
- Try refreshing browser

**Contract calls failing:**
- Verify CONTRACT_ID is correct
- Check backend is running on port 4000
- Ensure account has enough XLM for transactions

**3D visuals not rendering:**
- Update graphics drivers
- Check browser WebGL support (https://get.webgl.org/)
- Try different browser

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Stellar Soroban Docs](https://soroban.stellar.org/)
- [Freighter API Reference](https://developers.stellar.org/docs/building-apps/wallet/freighter)
- [Three.js Documentation](https://threejs.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 📄 License

MIT License - See LICENSE file in root directory

## 🤝 Contributing

Contributions welcome! Please ensure:
- Code follows TypeScript best practices
- Components are reusable and well-documented
- Animations enhance UX without hindering performance
