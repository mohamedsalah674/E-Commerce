const crypto = require('crypto');
require('express-async-errors');
const { body } = require('express-validator');
const BadRequestError = require('salahorg/errors/bad-request-error');
const validateRequest = require('salahorg/middlewares/validate-request');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const express = require('express');
const router = express.Router();



/*------------------------------------------------------------------- resetpassword ------------------------------------------------------*/

router.patch(
    '/api/users/resetpassword/:id/:token',
  
    [
      body('password')
        .trim()
        .notEmpty()
        .withMessage('password required')
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters'),
  
      body('passwordConfirm')
        .trim()
        .notEmpty()
        .withMessage('passwordConfirm required'),
    ],
    validateRequest,
    async (req, res) => {
      const { password, passwordConfirm } = req.body;
      if (password !== passwordConfirm) {
        throw new BadRequestError(
          'password and confiramtion passwoed must be identica'
        );
      }
  
      const { id } = req.params;
      const hashedJwt = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
      const user = await User.findOne({ _id: id });
      if (!user) {
        throw new BadRequestError('Invalid token or has expired');
      }
  
      user.password = req.body.password;
      user.passwordConfirm = req.body.password;
  
      user.passwordResetToken = undefined;
      user.resetPasswordExpires = undefined;
  
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const hashedconfirmPassword = await bcrypt.hash(passwordConfirm, salt);
  
      user.password = hashedPassword;
      user.passwordConfirm = hashedconfirmPassword;
  
      await user.save();
  
      res.status(201).send('Password updated successfully');
    }
  );
  
  module.exports = router;