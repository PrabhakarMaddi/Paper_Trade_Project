# Paper Bull 📈

A full-stack **paper trading** web application built with React, Node.js, Express, and MongoDB.

Trade stocks with **$100,000 in virtual money** using real-time (or mock) stock data.

## Features

- 🔐 JWT Authentication (Register / Login)
- 💰 $100,000 starting virtual balance
- 📊 Real-time stock quotes (Finnhub API with built-in mock fallback)
- 📈 Buy & Sell stocks with balance validation
- 🗂️ Portfolio tracker with live P&L per holding
- 🏆 Competitive leaderboard
- 📋 Paginated transaction history
- 🌙 Premium dark-mode fintech UI

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide Icons |
| Backend | Node.js, Express, JWT, bcryptjs |
| Database | MongoDB + Mongoose |
| API | Finnhub.io (optional, mock fallback included) |

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/atlas))
- (Optional) [Finnhub API key](https://finnhub.io/register)

### Installation

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and optionally FINNHUB_API_KEY
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Environment Variables (backend/.env)
```
PORT=5000
JWT_SECRET=your_secret_key
MONGO_URI=mongodb://localhost:27017/paper_trading
FINNHUB_API_KEY=your_api_key   # optional, mock data used if missing
```

## Project Structure

```
Paper_Trading/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connection
│   │   ├── models/       # User, Holding, Transaction
│   │   ├── routes/       # auth, stocks, trading, portfolio, leaderboard
│   │   ├── middleware/   # JWT auth guard
│   │   └── utils/        # Finnhub helper + mock data
│   └── server.js
└── frontend/
    └── src/
        ├── pages/        # Login, Register, Dashboard, Trade, History, Leaderboard
        ├── components/   # Navbar
        ├── context/      # AuthContext
        └── api/          # Axios instance
```

## License
prabhakarmaddi26
