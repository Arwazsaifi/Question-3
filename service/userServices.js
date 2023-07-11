const bcrypt = require('bcryptjs');
const User = require('../models/user');
const AccessToken = require('../models/AccessToken');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer');
const cloudnairy = require('cloudinary').v2;
const multer = require('multer');
require('dotenv').config();
console.log(process.env.NAME);

const registerUser = async (userData) => {
  const { username, password, confirmPassword, email, firstname, lastname } = userData;

  const userExist = await User.findOne({ username });

  if (userExist) {
    throw new Error('Username already exists.');
  }

  const emailExist = await User.findOne({ email });
  if (emailExist) {
    throw new Error('Email already exists.');
  }

  if (password !== confirmPassword) {
    throw new Error('Passwords do not match.');
  }

  const hashPass = await bcrypt.hash(password, 10);

  const newUser = new User({
    username: username,
    password: hashPass,
    email: email,
    firstname: firstname,
    lastname: lastname,
  });

  await newUser.save();

  return { message: 'User registered successfully.' };
};

const loginUser = async (username, password) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error('Invalid username.');
  }

  const passCorrect = await bcrypt.compare(password, user.password);
  if (!passCorrect) {
    throw new Error('Incorrect password.');
  }

  const accessToken = jwt.sign({ user_id: user._id }, 'secret_keys', { expiresIn: '1m' });
  const newAccessToken = new AccessToken({
    user_id: user._id,
    access_token: accessToken,
    expiry: new Date().getTime() + 36000,
  });
  await newAccessToken.save();

  return { access_token: accessToken };
};

const getUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }
  return { user };
};

const deleteUser = async (userId) => {
  await User.findByIdAndDelete(userId);
};

const getUsers = async (page) => {
  const limit = 10;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit);
  return users;
};

const addAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  const newAddress = {
    address: addressData.address,
    city: addressData.city,
    state: addressData.state,
    pin_code: addressData.pin_code,
    phone_no: addressData.phone_no,
  };

  user.addresses.push(newAddress);

  await user.save();
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).populate('addresses');
  if (!user) {
    throw new Error('User not found.');
  }
  return user;
};

const deleteAddress = async (userId, addressIds) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found.');
  }

  user.addresses = user.addresses.filter((address) => !addressIds.includes(address._id.toString()));

  await user.save();
};

const sendResetPasswordEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found with this email.');
  }

  const resetToken = jwt.sign({ user_id: user._id }, 'secret_key', { expiresIn: '1m' });

  let transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const resetLink = `http://localhost:6000/user/forget-password/${resetToken}`;

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password reset request',
    text: `You have requested to reset your password. Please click the following link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions);

  return { message: 'Password reset token sent to your email', resetToken };
};

const resetPassword = async (passwordResetToken, password) => {
  try {
    const decoded = jwt.verify(passwordResetToken, 'secret_key', { expiresIn: '5m' });
    const userId = decoded.user_id;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Invalid user.');
    }

    if (password !== confirmPassword) {
      throw new Error('Password and confirm password do not match.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const email = user.email;

    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset Password Confirmation',
      text: 'Your password has been successfully reset.',
    };

    transporter.sendMail(mailOptions);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Password reset token has expired.');
    }
    throw error;
  }
};

const uploadFileToCloudinary = async (file) => {
  cloudnairy.config({
    cloud_name: process.env.NAME,
    api_key: process.env.KEY,
    api_secret: process.env.SECRET,
  });

  const result = await cloudnairy.uploader.upload(file.path);

  return { message: 'Image uploaded successfully', imageUrl: result.secure_url };
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  deleteUser,
  getUsers,
  addAddress,
  getUserById,
  deleteAddress,
  sendResetPasswordEmail,
  resetPassword,
  uploadFileToCloudinary,
};
