
const { body, validationResult } = require('express-validator');

const ValidationOfSchema=[

    // for valating username field not empty
     body('username').notEmpty().withMessage('Username is required'),
  
    //for checking password is provide or not and it is correct or not.
     body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be6 chars long'),
  
      //required confirm password
     body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
        //for cheking password is matched or not 
        if (value !== req.body.password) {
          throw new Error('Passwords not match');
        }
        return true;
      }),

  // checking email is valid one and required
      body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email invalid'),
  
      //checking firstname field is not empty 
      body('firstname').notEmpty().withMessage('First name is required'),
     //checking lastname field not empty.
      body('lastname').notEmpty().withMessage('Last name is required'),
  ];
module.exports = ValidationOfSchema;
