const express = require('express');
const auth = require('../middleware/auth');
const { getQuote, searchStocks, getIntraday } = require('../utils/stockService');

const router = express.Router();

// GET /api/stock/quote/:symbol
router.get('/quote/:symbol', auth, async (req, res) => {
    try {
        const quote = await getQuote(req.params.symbol);
        if (!quote) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        res.json(quote);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock data' });
    }
});

// GET /api/stock/search/:query
router.get('/search/:query', auth, async (req, res) => {
    try {
        const results = searchStocks(req.params.query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error searching stocks' });
    }
});

// GET /api/stock/intraday/:symbol
router.get('/intraday/:symbol', auth, async (req, res) => {
    try {
        const data = await getIntraday(req.params.symbol);
        if (!data) {
            return res.status(404).json({ message: 'Stock not found' });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching intraday data' });
    }
});

module.exports = router;
