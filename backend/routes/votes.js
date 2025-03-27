const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Poll = require('../models/Poll');

// @route   POST api/votes/:pollId
// @desc    Vote on a poll
// @access  Private
router.post('/:pollId', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    // Check if poll has ended
    if (new Date(poll.endDate) < new Date()) {
      return res.status(400).json({ msg: 'This poll has ended' });
    }

    // Check if user has already voted
    if (poll.voters.includes(req.user.id)) {
      return res.status(400).json({ msg: 'You have already voted on this poll' });
    }

    const { optionId } = req.body;
    if (!optionId) {
      return res.status(400).json({ msg: 'Please select an option' });
    }

    // Find the option and increment its votes
    const option = poll.options.find(opt => opt._id.toString() === optionId);
    if (!option) {
      return res.status(400).json({ msg: 'Invalid option selected' });
    }

    option.votes += 1;
    poll.voters.push(req.user.id);
    poll.totalVotes += 1;

    await poll.save();
    res.json(poll);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/votes/:pollId
// @desc    Get votes for a specific poll
// @access  Public
router.get('/:pollId', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) {
      return res.status(404).json({ msg: 'Poll not found' });
    }

    res.json({
      totalVotes: poll.totalVotes,
      options: poll.options.map(opt => ({
        id: opt._id,
        text: opt.text,
        votes: opt.votes,
        percentage: poll.totalVotes > 0 
          ? Math.round((opt.votes / poll.totalVotes) * 100) 
          : 0
      }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 