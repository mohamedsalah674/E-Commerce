const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Credit Card', 'PayPal', 'Stripe', 'Other'], // Add other supported payment methods
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        enum: ['EUR', 'USD', 'EGP'], // Add other supported currencies
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
});

paymentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

paymentSchema.set('toJSON', {
    virtuals: true,
});

exports.Payment = mongoose.model('Payment', paymentSchema);

