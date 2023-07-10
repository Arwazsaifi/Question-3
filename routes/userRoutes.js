const express = require('express');
const {validationResult } = require('express-validator');
const User=require('../models/user')
const  userValidationSchema = require('../validator/userValidator');
const  validationToken= require('../middleware/auth');
const userController = require('../controller/userController');
const multer=require('multer');
const cloudnairy=require('cloudinary').v2;


const app = express();

app.use(express.json());

//route for user registration
app.post('/user/register',userValidationSchema,userController.registerUser);

//route for user login and generate token
app.post('/user/login',userController.loginUser);

//route for get user data
app.get('/user/get',validationToken,userController.getUser);

//route for deleting user
app.put('/user/delete',validationToken,userController.deleteUser);

// route for give list of user 
app.get('/user/list/:page',userController.getUserList);

//route for add user address 
app.post('/user/userAddress',validationToken,userController.userAddress);

//route for get all users along with addresss.
app.get('/user/get/:id',validationToken,userController.getUserById);

//route for delete address
app.delete('/user/address',validationToken,userController.deleteAddress);

//route for forget password
app.post('/user/forget-password',userController.passForget);

//route for reset password
app.put('/user/verify-reset-password/:passwordResetToken',userController.resetPassword);

//route for upload an image from local storage
app.put('/user/profile-image',upload.single('image'),userController.localStorage);

//route for upload a image from online cloudnairy storage.
app.put('/user/cloud-image',upload.single('profileImage'),userController.OnlineFileUpload);

app.listen(6000)
console.log("server is ruuning 6000")