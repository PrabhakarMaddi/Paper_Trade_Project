const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        symbol: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        companyName: {
            type: String,
            default: '',
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        avgBuyPrice: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { timestamps: true }
);

// Compound index: one holding per user per symbol
holdingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
