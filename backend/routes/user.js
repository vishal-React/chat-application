const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

router.post("/verify-user", async (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const { username, email } = decoded;
    console.log(username, email);
    res.json({ message: "User Verify", userData: decoded });
  } catch (error) {
    res.status(500).json({ error, message: "invalid user" });
  }
});

router.post("/userdata", async (req, res) => {
  console.log(req.body);

  const { username, PhoneNumber } = req.body.userInfo;
  const email = req.body.email;
  console.log(username, PhoneNumber, email);
  const user = new User({ username, PhoneNumber, email });
  await user.save();

  const token = jwt.sign({ username, email }, process.env.SECRET_KEY);
  console.log(token);

  res.json({ token, message: "user login successfull " });
});

module.exports = router;
