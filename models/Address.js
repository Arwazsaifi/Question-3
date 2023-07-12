const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  address: String,
  city: String,
  state: String,
  pin_code: String,
  phone_no: String,
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
