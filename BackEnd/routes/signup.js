const { body } = require('express-validator');
const BadRequestError = require('salahorg/errors/bad-request-error');
const validateRequest = require('salahorg/middlewares/validate-request');
const bcrypt = require('bcrypt');
const { sendVerificationEmail } = require('../utils/email');
const { totp } = require('otplib');
const User = require('../models/users');
const TOTP = require('../models/top');
const NotFoundError = require('salahorg/errors/not-found-error');
const express = require('express');
const router = express.Router();

const expirationTime = 60 * 1200; // seconds
router.post(
  '/api/users/signup',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is not valid'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required'),

    body('phone').notEmpty().withMessage('Phone is required'),
    body('street').optional().notEmpty().withMessage('Street is required'),
    body('apartment').optional().notEmpty().withMessage('Apartment is required'),
    body('zip').optional().notEmpty().withMessage('ZIP is required'),
    body('city').optional().notEmpty().withMessage('City is required'),
    body('country').optional().notEmpty().withMessage('Country is required'),
    body('role')
      .optional()
      .isIn(['Admin', 'User'])
      .withMessage('Invalid user role'),
  ],
  validateRequest,
  async (req, res) => {
    const { email, name, password, phone, street, apartment, zip, city, country, role } = req.body;

    const user = await User.findOne({ email: email });

    if (user && user.isVerified === true) {
      throw new BadRequestError('Account is already exist and verified');
    }

    // Create OTP
    totp.options = {
      ...totp.options,
      step: expirationTime,
      window: 0,
      digits: 10,
    };
    const token = totp.generate(email + process.env.TOTP_SECRET);

    const msg = {
      to: email,
      subject: 'Verification email',
      text: `This is a verification email to confirm your identity, please click on this link to complete the signup process`,
      html: `<h2>Hello, ${email}</h2><br><h2></a>, This is your verfication code :  ${token}</h2> <br>  <h2> It will expire in three hours <h2/>`,
    };

    if (user === false) {
      const existingTotp = await TOTP.findOne({
        userId: user._id,
      });

      if (!existingTotp) throw new BadRequestError('Token not found');
      existingTotp.token = token;
      await existingTotp.save();
    } else if (!user) {
      const newUser = new User({
        name,
        email,
        password,
        phone,
        street,
        apartment,
        zip,
        city,
        country,
        role,
        shippingAddress1: req.body.shippingAddress1,
      });

      await newUser.save();

      const newTotp = new TOTP({
        token: token,
        userId: newUser._id,
      });

      // Save TOTP to DB
      await newTotp.save();
    }

    // Send an email with the verification link
    const asc = sendVerificationEmail(
      msg,
      'ms2000.mohamedsalah@gmail.com',
      async (result) => {
        return res.status(201).send({ msg: 'Verification email sent' });
      },
      async (error) => {
        console.log(error);
        throw new BadRequestError('Verification email was not sent');
      }
    );
    console.log(asc);
  }
);

/*------------------------------------------------------------------verify token----------------------------------------------------*/

router.get('/api/users/verify-token/:token', async (req, res) => {
  const token = req.params.token;
  const existingTotp = await TOTP.findOne({ token: token });
  if (!existingTotp) throw new NotFoundError();

  const user = await User.findOne({
    _id: existingTotp.userId,
  });

  if (!user) throw new NotFoundError();
  const isValid = totp.check(token, user.email + process.env.TOTP_SECRET);

  console.log(user.email + process.env.TOTP_SECRET);
  console.log(token);
  console.log(isValid);
  if (!isValid) throw new BadRequestError('Token has expired');
  res.send({
    isValid: isValid,
    email: user.email,
    name: user.name,
  });
});

/*-------------------------------------------------------------------complete sign up-----------------------------------------------*/
router.post(
  '/api/users/complete-signup',
  [
    body('code').isString().withMessage('Token is required'),
    body('name').isString().withMessage('Name is required'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
        returnScore: false,
        pointsPerUnique: 1,
        pointsPerRepeat: 1,
        pointsForContainingLower: 5,
        pointsForContainingUpper: 2,
        pointsForContainingNumber: 1,
      })
      .withMessage('Password is not strong enough'),
  ],
  validateRequest,
  async (req, res) => {
    const { code, name, password } = req.body;

    // Check if token is stored
    const existingTotp = await TOTP.findOne({
      token: code,
    });
    if (!existingTotp) {
      console.log('error');
      throw new BadRequestError('Token does not belong to this email');
    }

    // Check if user is not found
    const user = await User.findById(existingTotp.userId);
    if (!user) throw new BadRequestError('User not found');
    if (user.isVerified) throw new BadRequestError('Account is already verified');

    // Check if token expired
    const isValid = totp.check(existingTotp.token, user.email + process.env.TOTP_SECRET);

    console.log(isValid);
    console.log(existingTotp.token);
    console.log(user.email + process.env.TOTP_SECRET);

    if (!isValid) throw new BadRequestError('Token has expired');
    // check if token belongs to user with this email
    if (!existingTotp.userId.equals(user._id)) {
      throw new BadRequestError('Token does not belong to this email');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(hashedPassword);

    user.set('password', hashedPassword);
    user.set('isVerified', true);
    user.set('name', name);
    await user.save();

    // Delete stored TOTP
    await TOTP.findByIdAndDelete(existingTotp._id);

    res.status(200).send(user);
  }
);

module.exports = router;
