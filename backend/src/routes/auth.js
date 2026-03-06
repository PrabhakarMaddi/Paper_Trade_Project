const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });

        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            const field = exists.email === email ? 'Email' : 'Username';
            return res.status(400).json({ message: `${field} already in use` });
        }

        const user = await User.create({
            username,
            email,
            passwordHash: password, // pre-save hook hashes it
            portfolioHistory: [{ value: 100000 }],
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid email or password' });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            balance: user.balance,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route GET /api/auth/me
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        balance: req.user.balance,
    });
});

module.exports = router;
