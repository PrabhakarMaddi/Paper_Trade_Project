const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Holding = require('../models/Holding');
const { getStockQuote } = require('../utils/stockHelper');

// @route GET /api/portfolio
router.get('/', protect, async (req, res) => {
    try {
        const holdings = await Holding.find({ userId: req.user._id });

        // Enrich each holding with current price
        const enriched = await Promise.all(
            holdings.map(async (h) => {
                try {
                    const quote = await getStockQuote(h.symbol);
                    const currentPrice = quote ? quote.price : h.avgBuyPrice;
                    const currentValue = parseFloat((currentPrice * h.quantity).toFixed(2));
                    const costBasis = parseFloat((h.avgBuyPrice * h.quantity).toFixed(2));
                    const pnl = parseFloat((currentValue - costBasis).toFixed(2));
                    const pnlPercent = parseFloat(((pnl / costBasis) * 100).toFixed(2));

                    return {
                        symbol: h.symbol,
                        companyName: h.companyName,
                        quantity: h.quantity,
                        avgBuyPrice: h.avgBuyPrice,
                        currentPrice,
                        currentValue,
                        costBasis,
                        pnl,
                        pnlPercent,
                    };
                } catch {
                    return {
                        symbol: h.symbol,
                        companyName: h.companyName,
                        quantity: h.quantity,
                        avgBuyPrice: h.avgBuyPrice,
                        currentPrice: h.avgBuyPrice,
                        currentValue: h.avgBuyPrice * h.quantity,
                        costBasis: h.avgBuyPrice * h.quantity,
                        pnl: 0,
                        pnlPercent: 0,
                    };
                }
            })
        );

        const investedValue = enriched.reduce((sum, h) => sum + h.costBasis, 0);
        const currentValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
        const totalPnl = parseFloat((currentValue - investedValue).toFixed(2));
        const totalPortfolioValue = parseFloat((req.user.balance + currentValue).toFixed(2));

        res.json({
            balance: req.user.balance,
            holdings: enriched,
            totalInvested: parseFloat(investedValue.toFixed(2)),
            totalCurrentValue: parseFloat(currentValue.toFixed(2)),
            totalPnl,
            totalPortfolioValue,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
