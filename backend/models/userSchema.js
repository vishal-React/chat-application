const mongoose = require("mongoose");

const user = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unqiue: true,
  },
  username: {
    type: String,
    required: true,
  },
  PhoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = mongoose.model("user", user);
module.exports = User;
