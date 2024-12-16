const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = jwt.sign(
            { 
                userId: user._id.toString(),
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, userId: user._id });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                userId: user._id.toString(),
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user._id });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get current user endpoint, optional but useful (if not getting any id etc.).
// Retrieve details of the authenticated user if needed
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
});

module.exports = router;