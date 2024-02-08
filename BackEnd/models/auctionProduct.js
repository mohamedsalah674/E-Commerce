const mongoose = require('mongoose');
const moment = require('moment-timezone');

const auctionProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '',
    },
    images: [{
        type: String,
    }],
    // ... other fields ...
    startingPrice: {
        type: Number,
        required: true,
    },
    currentPrice: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    paymentDeadline: {
        type: Number, // This could represent the payment deadline in hours
        default: 24, // Default to 24 hours if not specified
    },
    competitionEnd: {
        type: Date,
        required: true,
        get: (val) => moment(val).format('YYYY-MM-DD HH:mm:ss'), // Format when retrieving
        set: (val) => moment(val).toDate(), // Convert to Date object when setting
    },    
    winningUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bannedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled'],
        default: 'Active',
    },
    // ... other fields ...
});

// Virtual to check if the auction is active
auctionProductSchema.virtual('isActive').get(function () {
    const currentDate = moment();
    return this.isPublished && moment(this.competitionEnd).isSameOrAfter(currentDate);
});

exports.AuctionProduct = mongoose.model('AuctionProduct', auctionProductSchema);
