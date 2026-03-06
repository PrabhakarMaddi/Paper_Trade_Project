require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/stocks', require('./src/routes/stocks'));
app.use('/api/trade', require('./src/routes/trading'));
app.use('/api/portfolio', require('./src/routes/portfolio'));
app.use('/api/leaderboard', require('./src/routes/leaderboard'));
app.use('/api/transactions', require('./src/routes/transactions'));

// Health check
app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', message: 'Paper Trading API is running' })
);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
