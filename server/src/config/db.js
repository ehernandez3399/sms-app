const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function connectDB() {
  return mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
