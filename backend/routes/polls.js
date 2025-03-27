const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const Payment = require('../models/Payment');
const { auth, admin } = require('../middleware/auth');

// Get all polls
router.get('/', async (req, res) => {
    try {
        // If user is admin, show all polls. Otherwise, show only active polls
        const query = req.user?.role === 'admin' ? {} : { isActive: true };
        const polls = await Poll.find(query)
            .populate('creator', 'name')
            .sort({ createdAt: -1 });
        res.json(polls);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single poll
router.get('/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id)
            .populate('creator', 'name')
            .populate('voters', 'name');
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        // If user is not admin and poll is not active, return 404
        if (req.user?.role !== 'admin' && !poll.isActive) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create poll (admin only)
router.post('/', auth, admin, async (req, res) => {
    try {
        // Check for valid payment
        const validPayment = await Payment.findOne({
            userId: req.user.id,
            status: 'completed',
            expiresAt: { $gt: new Date() }
        });

        if (!validPayment) {
            return res.status(403).json({ 
                message: 'Payment required to create a poll',
                error: 'PAYMENT_REQUIRED'
            });
        }

        const { title, description, options, startDate, endDate, category } = req.body;

        // Validate input
        if (!title || !options || options.length < 2 || !startDate || !endDate || !category) {
            return res.status(400).json({ 
                message: 'Please provide all required fields',
                fields: {
                    title: !title ? 'Title is required' : null,
                    options: !options || options.length < 2 ? 'At least 2 options are required' : null,
                    startDate: !startDate ? 'Start date is required' : null,
                    endDate: !endDate ? 'End date is required' : null,
                    category: !category ? 'Category is required' : null
                }
            });
        }

        // Create new poll
        const poll = new Poll({
            title,
            description,
            options: options.map(option => ({ text: option, votes: 0 })),
            startDate,
            endDate,
            category,
            creator: req.user.id
        });

        await poll.save();
        res.status(201).json(poll);
    } catch (error) {
        console.error('Create poll error:', error);
        res.status(500).json({ 
            message: 'Server error while creating poll',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Vote on poll
router.post('/:id/vote', auth, async (req, res) => {
    try {
        const { optionId } = req.body;
        const poll = await Poll.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        // Check if poll is active
        if (!poll.isActive) {
            return res.status(400).json({ message: 'Poll is not active' });
        }

        // Check if user has already voted
        if (poll.voters.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update vote count
        const option = poll.options.id(optionId);
        if (!option) {
            return res.status(404).json({ message: 'Option not found' });
        }

        option.votes += 1;
        poll.totalVotes += 1;
        poll.voters.push(req.user.id);

        await poll.save();
        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update poll (admin only)
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const { title, description, options, endDate, isActive } = req.body;

        // Update fields
        if (title) poll.title = title;
        if (description) poll.description = description;
        if (endDate) poll.endDate = endDate;
        if (typeof isActive === 'boolean') poll.isActive = isActive;
        if (options) {
            poll.options = options.map(option => {
                const existingOption = poll.options.find(opt => opt._id.toString() === option._id);
                return existingOption ? { ...existingOption.toObject(), ...option } : { text: option.text, votes: 0 };
            });
        }

        await poll.save();
        res.json(poll);
    } catch (error) {
        console.error('Update poll error:', error);
        res.status(500).json({ 
            message: 'Server error while updating poll',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Delete poll (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        await poll.deleteOne();
        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Delete poll error:', error);
        res.status(500).json({ 
            message: 'Server error while deleting poll',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 