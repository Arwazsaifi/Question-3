const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const connectDB=require('../connection/database')
const AccessToken=require('../models/AccessToken')
const auth=require('../middleware/auth')
const mongoose =require('mongoose');
const jwt=require('jsonwebtoken');
const nodeMailer=require('nodemailer');
const {EMAIL,PASSWORD}=require('./env');
const cloudnairy=require('cloudinary').v2;
const multer=require('multer');

connectDB();


const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, confirmPassword, email, firstname, lastname } = req.body;

    const userExist = await User.findOne({ username });

    if (userExist) {
      return res.status(409).json({ error: 'Username already exists.' });
    }

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
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
    
    let config={
           service:'gmail',
           auth:{
            user:EMAIL,
            pass:PASSWORD
           }
    }
    let transporter=nodeMailer.createTransport(config);

    const mailOptions={
      from:EMAIL,
      to:email,
      subject:'Registration confirmation',
      text:`thanking you for registering with us ${username}`
    }
    transporter.sendMail(mailOptions,(error,info)=>
    {
      if(error)
      {
        console.error(error);
      }
      else
      {
        console.log('Email sent:',info.response);
      }
    })

    res.status(201).json({ message: 'User registered successfully.' });
  } 
  catch (error) {
    res.status(500).json({ error: 'User not registered.' });
  }
  
};


const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username.' });
    }

    const passCorrect = await bcrypt.compare(password, user.password);
    if (!passCorrect) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }
 // Generate account token using MD5
 const accessToken = jwt.sign({user_id:user._id},'secret_keys',{expiresIn:'1m',});
 // Save the account token in the access_token collection
 const newAccessToken = new AccessToken({
   user_id: user._id,
   access_token: accessToken,
   expiry: new Date().getTime()+360000, // 1 hour expiry
 });
 await newAccessToken.save();
 res.status(200).json({ access_token: accessToken });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'internal server error during login' });
  }
};


const getUser = async (req, res) => {
  const user = req.user;
  return res.status(200).json({ user });
};


const deleteUser = async (req, res) => {
  const user = req.user;

  try {
    await User.findByIdAndDelete(user._id);
    return res.status(200).json({ message: 'User deleted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'internal server error during deletation of user' });
  }
};


const getUserList = async (req, res,) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'internal server error for getting users list.' });
  }
};


const userAddress= async(req,res)=>
{
  try{
       const{
        user_id,
        address,
        city,
        state,
        pin_code,
        phone_no}=req.body;
        const user = await User.findById(user_id);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
    
        // Create a new address object
        const newAddress = {
          address,
          city,
          state,
          pin_code,
          phone_no,
        };
    
        // Add the new address to the user's addresses array
        user.addresses.push(newAddress);
    
        // Save the updated user with the new address
        await user.save();
    
        res.status(201).json({ message: 'Address added successfully.' });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'internal server Error during adding address.' });
      }
}

const getUserById= async(req,res)=>
{
   try{
      const userId=req.params.id;
      
      const user=await User.findById(userId).populate('addresses');
      if(!user)
      {
        return res.status(404).json({message:"user not found."});
      }
     
      res.status(200).json(user);
      //console.log('working');
   }
   catch(error)
   {
    console.error("error:",error)
    return res.status(500).json({message:"internal server error for getting user by ID"});
   }
}


const deleteAddress=async(req,res)=>{
  const {addressIds}=req.body;
  const userId=req.user._id;
  try{
       const user=await User.findById(userId);
       if(!user)
       {
        return res.status(400).json({message:"user not found"});
       }
      user.addresses=user.addresses.filter((address)=>!addressIds.includes(address._id.toString()));
       await user.save();
       return res.status(200).json({message:"address deleted successfully"})
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'internal Server error' });
  }
}


const passForget=async(req,res)=>
{
  const{email}=req.body;
  try{
    const user=await User.findOne({email});
    if(!user)
    {
      return res.status(400).json({message:"user not found to this email"});
    }
    
    const resetToken=jwt.sign({user_id:user._id},'secret_key',{expiresIn:'1m'});
      let config={
      service:'gmail',
       auth:{
       user:EMAIL,
       pass:PASSWORD
       }
       } 
       let transporter=nodeMailer.createTransport(config);
       const  reset=resetToken;
       const resetLink=`http://localhost:6000/user/forget-password/${reset}`;
       const mailOptions={
          from:EMAIL,
          to:email,
          subject:'Password reset request',
          reset,
          resetLink,
          text : `You have requested to reset your password. Please click the following link to reset your password: ${resetLink}`
       }
       transporter.sendMail(mailOptions)
      return res.status(200).json({message:"Password reset token sent to your email",resetToken});
  }
  catch(error)
  {
    console.error(error);
    return res.status(500).json({error:"internal server error"})
  }
}


const resetPassword=async(req,res)=>
{
  
  const {password,confirmPassword}=req.body;
  const passwordResetToken=req.params.passwordResetToken;
  console.log("....");
  try{
    
    const decoded =jwt.verify(passwordResetToken,'secret_key',{expiresIn:'5m'});
    const userId =decoded.user_id;
    
    const user=await User.findById(userId);
    if(!user)
    {
      return res.status(400).json({error:'Invalid user'});
    }
    if(password!==confirmPassword)
    {
      return res.status(400).json({error:"password and confirm password do not match"});
    }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password=hashedPassword;
  await user.save();
  let config={
    service:'gmail',
    auth:{
     user:EMAIL,
     pass:PASSWORD
    }
}
let transporter=nodeMailer.createTransport(config);
const email=user.email;
const mailOptions={
  from:EMAIL,
  to:email,
  subject:'Reset Password confirmation',
  text:'your password successfully rested'
}
 transporter.sendMail(mailOptions);
  return res.json({ message: 'Password reset successful' });
}
catch(error)
{
  if (error.name === 'TokenExpiredError') {
    return res.status(400).json({ error: 'Password reset token has expired' });
  }
  return res.status(500).json({error:"internal server error"})
}
}
const OnlineFileUpload=async(req,res)=>
{
  cloudnairy.config({
    cloud_name: 'djxxxbfvx', 
    api_key: '996135255462862', 
    api_secret: 'wWWpU-tb9fgew7hggs2nhloPg9U' 
    });

    const file=req.file;
    try{
    
        const result=await cloudnairy.uploader.upload(file.path);
        return res.json({message:'image uloaded successfully',imageUrl:result.secure_url});
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error uploading profile image to Cloudinary' });
      }
}

const localStorage=(req,res)=>
{
  const storage = multer.diskStorage({
    destination:'uploads',
   filename:(req,file,cb)=>
   {
    console.log(file)
    cb(null,`${Date.now()}--${file.originalname}`);
   }
})

const upload=multer({storage});

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
}



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
