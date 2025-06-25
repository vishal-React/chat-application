const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./lib/db");
db();
const sendotp = require("./routes/otp");
const user = require("./routes/user");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", sendotp);
app.use("/user", user);

app.get("/", (req, res) => {
  res.json({ message: "Working" });
});

app.listen(3030, () => {
  console.log("Server running on port 3030");
});
