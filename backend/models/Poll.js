const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Option text is required'],
        trim: true
    },
    votes: {
        type: Number,
        default: 0
    }
});

const pollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Poll title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    options: [optionSchema],
    category: {
        type: String,
        required: true,
        enum: ['Politics', 'Technology', 'Sports', 'Entertainment', 'Education', 'Other']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    totalVotes: {
        type: Number,
        default: 0
    },
    voters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
pollSchema.index({ category: 1, isActive: 1 });
pollSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Poll', pollSchema); 