const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide all required fields',
                fields: {
                    name: !name ? 'Name is required' : null,
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        // Validate email format
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide both email and password',
                fields: {
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Admin login
router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide both email and password',
                fields: {
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        // Find user
        const user = await User.findOne({ email, role: 'admin' }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            message: 'Server error during admin login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Admin only routes
router.get('/admin/users', auth, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ 
            message: 'Server error while fetching users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.put('/admin/users/:id', auth, admin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: 'User role updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ 
            message: 'Server error while updating user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 