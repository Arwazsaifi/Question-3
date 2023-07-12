
//database connection
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URL, {
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
