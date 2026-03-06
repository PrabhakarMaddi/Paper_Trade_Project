const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Holding = require('../models/Holding');
const { getStockQuote } = require('../utils/stockHelper');

// @route GET /api/leaderboard
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('username balance').lean();

        // For each user, compute current portfolio value from holdings
        const ranked = await Promise.all(
            users.map(async (user) => {
                const holdings = await Holding.find({ userId: user._id });
                let stockValue = 0;
                for (const h of holdings) {
                    try {
                        const quote = await getStockQuote(h.symbol);
                        if (quote) stockValue += quote.price * h.quantity;
                        else stockValue += h.avgBuyPrice * h.quantity;
                    } catch {
                        stockValue += h.avgBuyPrice * h.quantity;
                    }
                }
                return {
                    username: user.username,
                    balance: user.balance,
                    stockValue: parseFloat(stockValue.toFixed(2)),
                    totalValue: parseFloat((user.balance + stockValue).toFixed(2)),
                };
            })
        );

        ranked.sort((a, b) => b.totalValue - a.totalValue);

        res.json(ranked.slice(0, 20).map((u, i) => ({ rank: i + 1, ...u })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
