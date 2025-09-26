const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/Auth");
const Admin = require("../model/Admin");
const fetchUser = require("../middleware/fetchuser");

const router = express.Router();

router.post("/createuser", async (req, res) => {
  try {
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin)
      return res
        .status(400)
        .json({ error: "Sorry a Admin with this email already exists" });
    if (admin) {
      res.status(400).json({ msg: "Oppssss! Mobile already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const randPassword = `PMX${Math.floor(Math.random() * 10000000)}`;
      const hashedPassword = await bcrypt.hash(randPassword, salt);

      admin = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: hashedPassword,
      });
      res
        .status(201)
        .json({ status: true, msg: "account created!", admin, randPassword });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const payload = {
      admin: {
        id: admin.id,
        name: admin.name,
      },
    };
    const authtoken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ authtoken });
  } catch {
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
