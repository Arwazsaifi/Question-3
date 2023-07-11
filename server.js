const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;

app.use(bodyParser.json());

// Route for user 
app.use('/user', userRoutes);

app.listen(6000, () => {
  console.log('Server is running on port 6000');
});
