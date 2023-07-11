const mongoose = require('mongoose');

//user schema 
const userSchema=new mongoose.Schema({
    username:
    {
        type: String,
        unique:true
    },

    password:String,

    email:
    {
    type: String,
    unique:true
    },

    firstname: String,
    lastname: String,

    addresses: [
        {
          user_id:String,
          address: String,
          city: String,
          state: String,
          pin_code: String,
          phone_no: String,
        },
      ],
});

//user model
const User=mongoose.model('User',userSchema);

module.exports = User;