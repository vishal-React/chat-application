const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const OtpModel = require("../models/otpSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/send-otp", async (req, res) => {
  const email = req.body.email;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
  const maxAttempts = 4;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "OTP Verification",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  };

  try {
    await transporter.sendMail(mailOptions);

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    await OtpModel.findOneAndUpdate(
      { email },
      { otp: hashedOtp, expirationTime, maxAttempts },
      // upsert: true :- insert a new document if no document is found matching the email,  new: true :- to return the updated document rather than the original one
      { upsert: true, new: true }
    );

    res.json({ email });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const otp = req.body.otp;
    console.log(req.body);
    const data = await OtpModel.findOne({ email: req.body.email });
    console.log(data);

    // validating for time expire
    const currentTimestamp = Date.now();
    const expirationTime = new Date(data.expirationTime).getTime();
    if (expirationTime < currentTimestamp) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    // check IsOtp is correct or not
    const isMatch = await bcrypt.compare(otp, data.otp);
    if (!isMatch) {
      if (data.maxAttempts === 1) {
        return res.status(500).json({
          message:
            "You have exceeded the maximum number of attempts. Please request a new OTP.",
          maxAttempts: data.maxAttempts,
        });
      }

      data.maxAttempts -= 1;
      await data.save();

      return res.status(500).json({
        message: `Invalid OTP. You have ${data.maxAttempts} attempts left.`,
        maxAttempts: data.maxAttempts,
      });
    }

    res.json({ message: "Otp Verified" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
});

module.exports = router;
