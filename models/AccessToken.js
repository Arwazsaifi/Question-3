const mongoose = require('mongoose');

//access token schema 

const accessTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId,},
  access_token: String,
  expiry: Date,
});

const AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports = AccessToken;