const { validationResult } = require('express-validator');
const userService = require('../service/userServices');
const User = require('../models/user');
const connectDB=require('../connection/database');
const mongoose=require('mongoose');
connectDB();

const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userData = req.body;
    const response = await userService.registerUser(userData);

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await userService.loginUser(username, password);

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const response = await userService.getUser(userId);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    await userService.deleteUser(userId);

    res.status(200).json({ message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserList = async (req, res) => {
  try {
    const page = parseInt(req.params.page);
    const response = await userService.getUsers(page);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userAddress = async (req, res) => {
  try {
    const userId = req.body.user_id;
    const addressData = req.body;
    await userService.addAddress(userId, addressData);

    res.status(201).json({ message: 'Address added successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await userService.getUserById(userId);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressIds = req.body.addressIds;
    await userService.deleteAddress(userId, addressIds);

    res.status(200).json({ message: 'Address deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const passForget = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await userService.sendResetPasswordEmail(email);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const passwordResetToken = req.params.passwordResetToken;

    await userService.resetPassword(passwordResetToken, password);

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const OnlineFileUpload = async (req, res) => {
  try {
    const file = req.file;
    const response = await userService.uploadFileToCloudinary(file);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const localStorage = (req, res) => {
  try{
    if(req.file)
    {
     return res.status(200).json({message:"file uploded form local storage successfuly"});
    }
    else{
    res.status(400).send("please upload a valid image");
   }}
catch(error)
{
console.error("error:",error)
return res.status(500).json({message:"internal servre error"});
}
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  deleteUser,
  getUserList,
  userAddress,
  getUserById,
  deleteAddress,
  passForget,
  resetPassword,
  OnlineFileUpload,
  localStorage,
};
