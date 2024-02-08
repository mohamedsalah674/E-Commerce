const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
    },
    color: { 
        type: String,
    }
});

// Define a virtual field 'id' to return the hex string representation of _id
categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Set 'toJSON' option to include virtuals when converting document to JSON
categorySchema.set('toJSON', {
    virtuals: true,
});

// Export the Category model
exports.Category = mongoose.model('Category', categorySchema);
