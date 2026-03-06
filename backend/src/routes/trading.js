const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const { getStockQuote } = require('../utils/stockHelper');

// @route POST /api/trade/buy
router.post('/buy', protect, async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const qty = parseInt(quantity);

        if (!symbol || !qty || qty < 1)
            return res.status(400).json({ message: 'Symbol and quantity (>=1) are required' });

        const quote = await getStockQuote(symbol);
        if (!quote) return res.status(404).json({ message: `Stock '${symbol}' not found` });

        const total = parseFloat((quote.price * qty).toFixed(2));

        const user = await User.findById(req.user._id);
        if (user.balance < total)
            return res.status(400).json({
                message: `Insufficient balance. Need $${total.toLocaleString()}, have $${user.balance.toLocaleString()}`,
            });

        // Deduct balance
        user.balance = parseFloat((user.balance - total).toFixed(2));
        // Snapshot portfolio history
        user.portfolioHistory.push({ value: user.balance });
        await user.save();

        // Upsert holding
        const existing = await Holding.findOne({ userId: user._id, symbol: symbol.toUpperCase() });
        if (existing) {
            const newQty = existing.quantity + qty;
            existing.avgBuyPrice = parseFloat(
                ((existing.avgBuyPrice * existing.quantity + quote.price * qty) / newQty).toFixed(4)
            );
            existing.quantity = newQty;
            existing.companyName = quote.name;
            await existing.save();
        } else {
            await Holding.create({
                userId: user._id,
                symbol: symbol.toUpperCase(),
                companyName: quote.name,
                quantity: qty,
                avgBuyPrice: quote.price,
            });
        }

        // Record transaction
        const tx = await Transaction.create({
            userId: user._id,
            symbol: symbol.toUpperCase(),
            companyName: quote.name,
            type: 'buy',
            quantity: qty,
            price: quote.price,
            total,
        });

        res.status(201).json({
            message: `Bought ${qty} shares of ${symbol.toUpperCase()} at $${quote.price}`,
            newBalance: user.balance,
            transaction: tx,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/trade/sell
router.post('/sell', protect, async (req, res) => {
    try {
        const { symbol, quantity } = req.body;
        const qty = parseInt(quantity);

        if (!symbol || !qty || qty < 1)
            return res.status(400).json({ message: 'Symbol and quantity (>=1) are required' });

        const holding = await Holding.findOne({
            userId: req.user._id,
            symbol: symbol.toUpperCase(),
        });

        if (!holding || holding.quantity < qty)
            return res.status(400).json({
                message: `Insufficient holdings. You own ${holding ? holding.quantity : 0} shares of ${symbol.toUpperCase()}`,
            });

        const quote = await getStockQuote(symbol);
        if (!quote) return res.status(404).json({ message: `Stock '${symbol}' not found` });

        const total = parseFloat((quote.price * qty).toFixed(2));

        // Credit balance
        const user = await User.findById(req.user._id);
        user.balance = parseFloat((user.balance + total).toFixed(2));
        user.portfolioHistory.push({ value: user.balance });
        await user.save();

        // Update or remove holding
        holding.quantity -= qty;
        if (holding.quantity === 0) {
            await holding.deleteOne();
        } else {
            await holding.save();
        }

        // Record transaction
        const tx = await Transaction.create({
            userId: user._id,
            symbol: symbol.toUpperCase(),
            companyName: quote.name,
            type: 'sell',
            quantity: qty,
            price: quote.price,
            total,
        });

        res.json({
            message: `Sold ${qty} shares of ${symbol.toUpperCase()} at $${quote.price}`,
            newBalance: user.balance,
            transaction: tx,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
