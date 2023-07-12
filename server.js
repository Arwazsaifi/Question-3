const express = require('express');
const app = express();
const userRoutes = require('./routes/index');

app.use(express.json());
app.use('/',userRoutes)

app.listen(6000, () => {
  console.log('Server is running on port 6000');
});
