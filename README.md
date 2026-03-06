# 🐂 Paper Bull - Full-Stack Paper Trading Platform

A premium stock market paper trading platform where users can practice trading with virtual money ($100,000) using real-time or simulated stock prices.

## 🚀 Teck Stack
- **Frontend**: React, Vite, Recharts, Lucide, Axios
- **Backend**: Node.js, Express, JWT, Mongoose
- **Database**: MongoDB
- **Styling**: Vanilla CSS (Custom Design System, Dark Mode)
- **Deployment**: Docker, Docker Compose

## ✨ Core Features
- **User Authentication**: Secure JWT-based Signup/Login/Logout.
- **Virtual Wallet**: Start with $100,000 virtual balance.
- **Trade Execution**: Real-time buy/sell with balance and holdings validation.
- **Portfolio Management**: Track holdings, average cost, market value, and unrealized P&L.
- **Dynamic Charts**: Intraday candlestick charts for technical analysis.
- **Global Leaderboard**: Compete with other users based on net worth.
- **Modern UI**: Full dark/light mode support with professional fintech aesthetics.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Docker (Optional, for containerized setup)

### Environment Configuration
Create a `.env` file in the `server` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paperbull
JWT_SECRET=your_jwt_secret_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```
> [!NOTE]
> If `ALPHA_VANTAGE_API_KEY` is not provided, the app will automatically fall back to simulated prices using a random-walk algorithm for 30 popular stocks.

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
   npm dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Setup
Run the following command in the root directory:
```bash
docker-compose up --build
```
The app will be available at [http://localhost](http://localhost).

## 📊 Database Schema
- **Users**: `id, name, email, password, balance`
- **Trades**: `id, userId, stockSymbol, quantity, price, type, timestamp`
- **Portfolio**: `userId, stockSymbol, quantity, avgPrice`

## 🛡️ License
MIT
