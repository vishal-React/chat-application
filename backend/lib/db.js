const mongoose = require("mongoose");
const URI = process.env.URI;

const db = () => {
  try {
    mongoose.connect(URI);
    console.log("mongodb connect sucessfully");
  } catch (error) {
    console.log(error);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = db;
