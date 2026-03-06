const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { getQuote, SIMULATED_STOCKS } = require('../utils/stockService');

const router = express.Router();

// POST /api/trade/buy
router.post(
    '/buy',
    auth,
    [
        body('symbol').trim().notEmpty().withMessage('Stock symbol is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { symbol, quantity } = req.body;
            const upperSymbol = symbol.toUpperCase();

            // Get current price
            const quote = await getQuote(upperSymbol);
            if (!quote) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            const total = Math.round(quote.price * quantity * 100) / 100;

            // Check balance
            const user = await User.findById(req.user._id);
            if (user.balance < total) {
                return res.status(400).json({
                    message: `Insufficient balance. Need $${total.toFixed(2)} but have $${user.balance.toFixed(2)}`
                });
            }

            // Deduct balance
            user.balance = Math.round((user.balance - total) * 100) / 100;
            await user.save();

            // Record trade
            const trade = await Trade.create({
                userId: user._id,
                stockSymbol: upperSymbol,
                stockName: quote.name,
                quantity,
                price: quote.price,
                type: 'BUY',
                total
            });

            // Update portfolio
            let portfolio = await Portfolio.findOne({ userId: user._id, stockSymbol: upperSymbol });
            if (portfolio) {
                const newTotalInvested = portfolio.totalInvested + total;
                const newQuantity = portfolio.quantity + quantity;
                portfolio.avgPrice = Math.round((newTotalInvested / newQuantity) * 100) / 100;
                portfolio.quantity = newQuantity;
                portfolio.totalInvested = Math.round(newTotalInvested * 100) / 100;
                await portfolio.save();
            } else {
                await Portfolio.create({
                    userId: user._id,
                    stockSymbol: upperSymbol,
                    stockName: quote.name,
                    quantity,
                    avgPrice: quote.price,
                    totalInvested: total
                });
            }

            res.status(201).json({
                message: `Successfully bought ${quantity} shares of ${upperSymbol}`,
                trade,
                balance: user.balance
            });
        } catch (error) {
            console.error('Buy error:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/trade/sell
router.post(
    '/sell',
    auth,
    [
        body('symbol').trim().notEmpty().withMessage('Stock symbol is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { symbol, quantity } = req.body;
            const upperSymbol = symbol.toUpperCase();

            // Check holdings
            const portfolio = await Portfolio.findOne({ userId: req.user._id, stockSymbol: upperSymbol });
            if (!portfolio || portfolio.quantity < quantity) {
                const held = portfolio ? portfolio.quantity : 0;
                return res.status(400).json({
                    message: `Insufficient holdings. You have ${held} shares of ${upperSymbol}`
                });
            }

            // Get current price
            const quote = await getQuote(upperSymbol);
            if (!quote) {
                return res.status(404).json({ message: 'Stock not found' });
            }

            const total = Math.round(quote.price * quantity * 100) / 100;

            // Add balance
            const user = await User.findById(req.user._id);
            user.balance = Math.round((user.balance + total) * 100) / 100;
            await user.save();

            // Record trade
            const trade = await Trade.create({
                userId: user._id,
                stockSymbol: upperSymbol,
                stockName: quote.name,
                quantity,
                price: quote.price,
                type: 'SELL',
                total
            });

            // Update portfolio
            portfolio.quantity -= quantity;
            portfolio.totalInvested = Math.round(portfolio.avgPrice * portfolio.quantity * 100) / 100;
            if (portfolio.quantity === 0) {
                await Portfolio.deleteOne({ _id: portfolio._id });
            } else {
                await portfolio.save();
            }

            res.status(201).json({
                message: `Successfully sold ${quantity} shares of ${upperSymbol}`,
                trade,
                balance: user.balance
            });
        } catch (error) {
            console.error('Sell error:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// GET /api/trade/history
router.get('/history', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type; // BUY or SELL filter

        const filter = { userId: req.user._id };
        if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
            filter.type = type.toUpperCase();
        }

        const total = await Trade.countDocuments(filter);
        const trades = await Trade.find(filter)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            trades,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
