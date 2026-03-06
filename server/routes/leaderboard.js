const express = require('express');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const { getQuote } = require('../utils/stockService');

const router = express.Router();

// GET /api/leaderboard
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).select('name balance createdAt');

        const leaderboard = await Promise.all(
            users.map(async (user) => {
                const holdings = await Portfolio.find({ userId: user._id });

                let portfolioValue = 0;
                let totalInvested = 0;

                for (const h of holdings) {
                    const quote = await getQuote(h.stockSymbol);
                    const price = quote ? quote.price : h.avgPrice;
                    portfolioValue += price * h.quantity;
                    totalInvested += h.avgPrice * h.quantity;
                }

                const netWorth = Math.round((user.balance + portfolioValue) * 100) / 100;
                const startingBalance = 1000000; // Updated to 10 Lakhs for Indian Context
                const totalReturn = Math.round((netWorth - startingBalance) * 100) / 100;
                const returnPercent = ((totalReturn / startingBalance) * 100).toFixed(2);

                return {
                    name: user.name,
                    netWorth,
                    totalReturn,
                    returnPercent: parseFloat(returnPercent),
                    joinedAt: user.createdAt
                };
            })
        );

        // Sort by net worth descending
        leaderboard.sort((a, b) => b.netWorth - a.netWorth);

        // Add rank
        const ranked = leaderboard.map((entry, i) => ({ rank: i + 1, ...entry }));

        res.json(ranked);
    } catch (error) {
        console.error('Leaderboard error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
