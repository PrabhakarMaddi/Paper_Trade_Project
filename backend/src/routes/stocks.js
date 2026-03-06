const express = require('express');
const router = express.Router();
const { getStockQuote, searchStocks } = require('../utils/stockHelper');

// @route GET /api/stocks/quote?symbol=AAPL
router.get('/quote', async (req, res) => {
    try {
        const { symbol } = req.query;
        if (!symbol) return res.status(400).json({ message: 'Symbol is required' });

        const data = await getStockQuote(symbol);
        if (!data) return res.status(404).json({ message: `Symbol '${symbol}' not found` });

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/stocks/search?q=apple
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query is required' });

        const results = await searchStocks(q);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/stocks/trending
router.get('/trending', async (req, res) => {
    try {
        const { MOCK_STOCKS } = require('../utils/stockHelper');
        const tickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA', 'META', 'AMZN'];
        const stocks = await Promise.all(
            tickers.map((sym) => getStockQuote(sym))
        );
        res.json(stocks.filter(Boolean));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
