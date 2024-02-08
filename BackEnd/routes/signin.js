require('express-async-errors');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const BadRequestError = require('salahorg/errors/bad-request-error');
const validateRequest = require('salahorg/middlewares/validate-request');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/users');



/*------------------------------------------------------------------- signIn ------------------------------------------------------*/

router.post(
    '/api/users/signin',
    [
      body('email').isEmail().withMessage('invalid email address'),
      body('password')
        .trim()
        .notEmpty()
        .withMessage('password required')
         
      // body('URL')
      // .notEmpty()
      // .isString()
      // .withMessage("URL must be provided sucessfully")
    ],
    validateRequest,
    async (req, res) => {
      const { email, password } = req.body;
  
      if (!password){
        throw new BadRequestError("Password required")
      }
  
  
  
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new BadRequestError('Invalid credentials');
      }
  
  
  
  
  if (!user.isVerified) {
        throw new BadRequestError('This user is not Verified');
      }
  
      const passwordsMatch = await bcrypt.compare(password, user.password);
      // if (!passwordsMatch) {
      //   throw new BadRequestError('Invalid password ');
      // }
    
      // Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email : user.email
        },
        process.env.JWT_KEY
      );
  
      // Store it on session object
      req.headers['authorization'] = token;
  
      console.log(
        req.headers.authorization,
        'req.header.authorization'
      );
  
      try {
        res.status(200).send({
          success: true,
          message: 'login successfully',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: 'Error in login',
          error,
        });
      }
    }
  );

  
  module.exports = router;