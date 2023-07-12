// middlewares/authMiddleware.js
const AccessToken = require('../models/AccessToken');
const User=require('../models/user')

//validation of token 
const validationToken = async (req, res, next) => {
  const access_token = req.headers.authorization;

  try {
     // Find account token in access_token collection
    const accessToken = await AccessToken.findOne({access_token});

    if (!accessToken) {
      return res.status(400).json({ message: 'Invalid access token' });
    }

    // Check if access token expired
    if (accessToken.expiry < Date.now()) {
      await AccessToken.deleteOne({ access_token });
      return res.status(400).json({ message: 'Access token has expired' });
    }

    const user = await User.findById(accessToken.user_id);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    req.user = user;

    next();

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error during validation' });
  }
};

module.exports = validationToken;
