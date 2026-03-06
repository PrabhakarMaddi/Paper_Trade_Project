const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    stockSymbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    stockName: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    avgPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalInvested: {
        type: Number,
        default: 0
    }
});

// Compound index for unique user-stock combination
portfolioSchema.index({ userId: 1, stockSymbol: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
