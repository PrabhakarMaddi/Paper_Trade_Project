const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    stockSymbol: {
        type: String,
        required: [true, 'Stock symbol is required'],
        uppercase: true,
        trim: true
    },
    stockName: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be positive']
    },
    type: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: [true, 'Trade type is required']
    },
    total: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trade', tradeSchema);
