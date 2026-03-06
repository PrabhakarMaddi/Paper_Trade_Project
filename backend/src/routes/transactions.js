const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

// @route GET /api/transactions
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Transaction.countDocuments({ userId: req.user._id });
        const transactions = await Transaction.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            transactions,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
