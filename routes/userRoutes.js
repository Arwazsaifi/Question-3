const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const multer = require('multer');

// Route for user registration
router.post('/register', userController.registerUser);

// Route for user login and generate token
router.post('/login', userController.loginUser);

// Route for get user data
router.get('/get', userController.getUser);

// Route for deleting user
router.put('/delete', userController.deleteUser);

// Route for giving list of users
router.get('/list/:page', userController.getUserList);

// Route for adding user address
router.post('/userAddress', userController.userAddress);

// Route for getting a user along with address
router.get('/get/:id', userController.getUserById);

// Route for deleting address
router.delete('/address', userController.deleteAddress);

// Route for forget password
router.post('/forget-password', userController.passForget);

// Route for reset password
router.put('/verify-reset-password/:passwordResetToken', userController.resetPassword);

// Route for uploading an image from local storage
const storage = multer.diskStorage({
    destination:'./uploads/images',
   filename:(req,file,cb)=>
   {
    console.log(file)
    cb(null,`${Date.now()}--${file.originalname}`);
   }
})
const upload = multer({storage});
router.put('/profile-image', upload.single('image'), userController.localStorage);

// Route for uploading an image from online cloudinary
router.put('/cloud-image', upload.single('profileImage'), userController.OnlineFileUpload);

module.exports = router;
