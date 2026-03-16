# 🐂 Paper Bull (Indian Markets) - Full-Stack Paper Trading Platform

A premium, high-performance Indian stock market paper trading platform. Practice trading with virtual money (**₹10,00,000**) using real-time NSE/BSE stock data.

![Premium Dashboard](https://img.shields.io/badge/UI-Elite_Trader-indigo)
![Currency](https://img.shields.io/badge/Currency-INR_%E2%82%B9-green)
![Data Source](https://img.shields.io/badge/Data-Yahoo_Finance-blue)

## ✨ Core Features

- **🔐 Secure Authentication**: Robust JWT-based Signup/Login system with encrypted password storage.
- **💰 Virtual Capital**: Every user starts with a virtual balance of **₹10,00,000 (10 Lakhs)** to build their portfolio.
- **📈 Advanced Market Analytics**: 
  - Dynamic Area Charts powered by **Recharts**.
  - Interactive time ranges: **1D, 1M, 3M, 6M, 1Y, and 3Y**.
  - Real-time intraday data with 1-minute auto-refresh for active trading.
- **🇮🇳 Indian Market Focus**:
  - Live search and tracking for **NSE/BSE** stocks.
  - Predefined **NIFTY 50** market movers tracking (Top Gainers & Losers).
  - All values, MTM, and P&L calculated in Indian Rupees (₹).
- **💼 Portfolio Management**: Detailed tracking of holdings, average buy price, current market value, and unrealized gains.
- **🏆 Global Leaderboard**: Real-time ranking system to compete with other traders based on total net worth.
- **🎨 Elite UI/UX**: Luxury "Zinc-based" dark mode design built with **Tailwind CSS v4** for a professional trading experience.

## 🚀 Tech Stack

### Frontend
- **React 18** & **Vite**: Ultra-fast development and build pipeline.
- **Tailwind CSS v4**: Modern, utility-first styling with custom zinc-palette triggers.
- **Recharts**: High-performance charting library for financial data visualization.
- **Lucide React**: Clean, consistent iconography.

### Backend
- **Node.js** & **Express**: Scalable asynchronous server architecture.
- **Mongoose**: Elegant MongoDB object modeling.
- **JWT**: Secure stateless session management.
- **Yahoo Finance API**: Real-time market data integration via `yahoo-finance2`.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18.0 or higher)
- MongoDB (Running locally or via Atlas)

### Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paperbull
JWT_SECRET=your_jwt_secret_key_here
```

### Local Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PrabhakarMaddi/Paper_Trade_Project.git
   cd Paper_Trade_Project
   ```

2. **Run Backend Service**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Run Frontend Application**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   *Visit [http://localhost:5173](http://localhost:5173) to start trading.*

## 🛡️ License

Copyright © 2026 **Prabhakar Maddi**. All rights reserved.

This project is licensed under the MIT License - see the LICENSE file for details. (Note: Licensing is currently assigned specifically for personal use and portfolio representation by Prabhakar Maddi).
