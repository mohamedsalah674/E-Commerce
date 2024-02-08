const mongoose = require('mongoose');
const { totp } = require('otplib');

const totpSchema = new mongoose.Schema({
  token: String,
  userId: mongoose.Types.ObjectId,
});

totpSchema.methods.isExpired = function () {
  console.log(this.token);
  console.log(process.env.TOTP_SECRET);

  return totp.check(this.token, process.env.TOTP_SECRET);
};
const TOTP = mongoose.model('TOTP', totpSchema);

module.exports = TOTP;
