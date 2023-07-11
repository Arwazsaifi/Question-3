// middlewares/authMiddleware.js
const AccessToken = require('../models/AccessToken');

const validationAccessToken = async (req, res, next) => {
  const access_token = req.headers.authorization;

  try {
    const decoded=jwt.verify(access_token,'secret_key');

    const user_id=decoded.user_id;

    // Find the user by ID
    User.findById(user_id, (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'Invalid access token' });
      }
      const currentTime = Date.now() / 1000;
      if (decoded.expiry < currentTime) {
        return res.status(401).json({ error: 'Access token has expired' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Invalid access token' });
  }
};

module.exports = validationAccessToken;
