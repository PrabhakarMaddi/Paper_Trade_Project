const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getQuote } = require('../utils/stockService');

// GET /api/user/watchlist
router.get('/watchlist', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const watchlist = user.watchlist || [];
        const enrichedWatchlist = await Promise.all(
            watchlist.map(async (symbol) => {
                try {
                    const quote = await getQuote(symbol);
                    if (quote) return quote;
                } catch (e) {
                    console.error(`Watchlist quote fetch error for ${symbol}:`, e.message);
                }
                return { symbol, name: symbol, price: 0, change: 0, changePercent: '0.00%', previousClose: 0 };
            })
        );

        res.json(enrichedWatchlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/user/watchlist
// Body: { symbol: 'RELIANCE.NS' }
router.post('/watchlist', auth, async (req, res) => {
    try {
        const { symbol } = req.body;
        if (!symbol) return res.status(400).json({ message: 'Symbol is required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.watchlist) user.watchlist = [];

        if (!user.watchlist.includes(symbol)) {
            user.watchlist.push(symbol);
            await user.save();
        }

        res.json({ message: 'Added to watchlist', watchlist: user.watchlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/user/watchlist/:symbol
router.delete('/watchlist/:symbol', auth, async (req, res) => {
    try {
        const symbol = req.params.symbol;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.watchlist) user.watchlist = [];

        user.watchlist = user.watchlist.filter(s => s !== symbol);
        await user.save();

        res.json({ message: 'Removed from watchlist', watchlist: user.watchlist });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
