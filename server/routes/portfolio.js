const express = require('express');
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const { getQuote } = require('../utils/stockService');

const router = express.Router();

// GET /api/portfolio
router.get('/', auth, async (req, res) => {
    try {
        const holdings = await Portfolio.find({ userId: req.user._id });

        // Fetch live prices for all holdings
        const enriched = await Promise.all(
            holdings.map(async (h) => {
                const quote = await getQuote(h.stockSymbol);
                const currentPrice = quote ? quote.price : h.avgPrice;
                const currentValue = Math.round(currentPrice * h.quantity * 100) / 100;
                const investedValue = Math.round(h.avgPrice * h.quantity * 100) / 100;
                const pnl = Math.round((currentValue - investedValue) * 100) / 100;
                const pnlPercent = investedValue > 0
                    ? ((pnl / investedValue) * 100).toFixed(2)
                    : '0.00';

                return {
                    stockSymbol: h.stockSymbol,
                    stockName: h.stockName,
                    quantity: h.quantity,
                    avgPrice: h.avgPrice,
                    currentPrice,
                    investedValue,
                    currentValue,
                    pnl,
                    pnlPercent: parseFloat(pnlPercent)
                };
            })
        );

        const totalInvested = enriched.reduce((sum, h) => sum + h.investedValue, 0);
        const totalCurrentValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
        const totalPnl = Math.round((totalCurrentValue - totalInvested) * 100) / 100;
        const totalPnlPercent = totalInvested > 0
            ? ((totalPnl / totalInvested) * 100).toFixed(2)
            : '0.00';

        res.json({
            holdings: enriched,
            summary: {
                totalInvested: Math.round(totalInvested * 100) / 100,
                totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
                totalPnl,
                totalPnlPercent: parseFloat(totalPnlPercent),
                balance: req.user.balance,
                netWorth: Math.round((req.user.balance + totalCurrentValue) * 100) / 100
            }
        });
    } catch (error) {
        console.error('Portfolio error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
