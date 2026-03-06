const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post(
    '/register',
    [
        body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { name, email, password } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const user = await User.create({ name, email, password });
            const token = generateToken(user._id);

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    balance: user.balance
                }
            });
        } catch (error) {
            console.error('Register error:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = generateToken(user._id);

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    balance: user.balance
                }
            });
        } catch (error) {
            console.error('Login error:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                balance: req.user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
