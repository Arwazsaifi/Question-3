
//database connection
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mydb4', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Database connected');
  } 
  catch (error) {
    console.error('Failed to connect to the database:', error);
  }
};

module.exports = connectDB;
