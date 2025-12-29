const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/Auth");
const Admin = require("../model/Admin");
const fetchAdmin = require("../middleware/fetchAdmin");
const Employee = require("../model/Employee");
const Investor = require("../model/Investor");

const router = express.Router();

// check Investor added or not
router.get("/response", (req, res) => {
  res.json({ status: true });
});

module.exports = router;
