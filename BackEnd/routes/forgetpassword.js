
require('express-async-errors');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const BadRequestError = require('salahorg/errors/bad-request-error');
const validateRequest = require('salahorg/middlewares/validate-request');
const { sendVerificationEmail } = require('../utils/email');
const User = require('../models/users');
const express = require('express');
const router = express.Router();

/*------------------------------------------------------------------- forgotPassword ------------------------------------------------------*/

router.post(
    '/api/users/forgotpassword',
  
    [body('email').isEmail().withMessage('invalid email address')],
  
    validateRequest,
    async (req, res) => {
      const { email } = req.body;
  
      if (!email) {
        throw new BadRequestError('Email is required');
      }
      const user = await User.findOne({ email });
      if (!user) {
        throw new BadRequestError('there is no user with email address');
      }
      // const resetToken = user.createPasswordResetToken();
      // await user.save({ validateBeforeSave: false });
      // console.log(resetToken);
  
      // const resetURL = `${req.protocol}://${req.get(
      //   'host'
      // )}/api/users/resetpassword/${resetToken}`;
  
      const payload = {
        email: user.email,
        id: user._id,
      };
      console.log(user._id);
  
      const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '15m' });
  
      console.log(token);
      const link = `${req.protocol}://etqan.dev/api/users/resetpassword/${user._id}/${token}`;
      const msg = {
        to: email,
        subject: 'Verification email',
        text: `This is a verification email to confirm your identity, please click on this link to complete the signup process`,
        html: `<h2>Hello, ${email}</h2><br><h2>Your verification link is <a href="http://etqan.dev//resetpassword/${user.id}/${token}">${link}</a>, it expires in two hours</h2>`,
      };
  
      sendVerificationEmail(
        msg,'ms2000.mohamedsalah@gmail.com',
        async (result) => {
          return res.status(201).send({ msg: 'verification email sent' });
        },
        async (error) => {
          console.log(error);
          throw new BadRequestError('zemail was not sent');
        }
      );
      console.log(msg);
  
    }
  );

  
  module.exports = router;