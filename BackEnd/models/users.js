const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
  },
  email: {
      type: String,
      required: true,
  },
  password: {
      type: String,
      required: true,
  },

  passwordConfirm: {
    type: String,
  },

  phone: {
      type: String,
      required: true,
  },
  street: {
      type: String,
      default: ''
  },
  apartment: {
      type: String,
      default: ''
  },
  zip :{
      type: String,
      default: ''
  },
  city: {
      type: String,
      default: ''
  },
  country: {
      type: String,
      default: ''
  }
  ,
  role: {
    type: String,
    enum: [
      'Admin',
      'User'
    ]
  },

  isVerified: {
    type: Boolean,
    default: false,
},

shippingAddress1: {
  type: String,
  required: true,
},

  }
 ,
  { timestamps: true }
);



const User = mongoose.model('User', UserSchema);

module.exports = User;
