# 🐂 Paper Bull (Indian Markets) - Full-Stack Paper Trading Platform

A premium Indian stock market paper trading platform where users can practice trading with virtual money (**₹10,00,000**) using NSE/BSE stock data.

## 🚀 Teck Stack
- **Frontend**: React, Vite, **Tailwind CSS**, Recharts, Lucide
- **Backend**: Node.js, Express, JWT, Mongoose
- **Database**: MongoDB
- **Styling**: Tailwind CSS (Refined Fintech Design System, Dark Mode)
- **Deployment**: Docker, Docker Compose

## ✨ Core Features
- **User Authentication**: Secure JWT-based Signup/Login/Logout.
- **Virtual Wallet**: Start with **₹10 Lakhs** virtual balance.
- **NSE/BSE Integration**: NIFTY 50 stock data and simulated execution.
- **Trade Execution**: Indian market-specific buy/sell logic (9:15 AM - 3:30 PM simulation).
- **Portfolio Management**: Track holdings, average cost, MTM, and unrealized P&L in Rupee (₹).
- **Dynamic Charts**: Intraday area charts for technical analysis.
- **Global Leaderboard**: Compete with other Indian traders based on net worth.
- **Modern UI**: Luxury "Elite Trader" aesthetic with Tailwind CSS and full Dark Mode support.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker (Optional)

### Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paperbull
JWT_SECRET=your_jwt_secret_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```
> [!NOTE]
> The app is pre-configured with **NIFTY 50** mock data (Reliance, TCS, HDFC Bank, etc.) as a fallback for any stock symbol.

### Local Installation

1. **Clone the repo**:
   ```bash
   git clone https://github.com/PrabhakarMaddi/Paper_Trade_Project.git
   cd Paper_Trade_Project
   ```

2. **Backend Setup**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Docker Deployment
```bash
docker-compose up --build
```
The app will be available at [http://localhost](http://localhost).

## 🛡️ License
MIT
