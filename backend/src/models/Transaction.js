const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
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
        },
        companyName: {
            type: String,
            default: '',
        },
        type: {
            type: String,
            enum: ['buy', 'sell'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
