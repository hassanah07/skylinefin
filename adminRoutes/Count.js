const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Loan = require("../model/Loan");
const Admin = require("../model/Admin");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");
const Employee = require("../model/Employee");

const router = express.Router();

// get EMI Data from DATABASE
router.post("/customerCount", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    const getData = await Customer.find().sort({ updatedAt: -1 });
    res.json({ getData, login: true });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server Unavailable", type: "error", login: false });
  }
});
router.post("/employeeCount", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    const getData = await Employee.find().sort({ updatedAt: -1 });
    res.json({ getData, login: true });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server Unavailable", type: "error", login: false });
  }
});
router.post("/loanCount", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    const getData = await Loan.find().sort({ updatedAt: -1 });
    res.json({ getData, login: true });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Server Unavailable", type: "error", login: false });
  }
});
router.post("/pendingLoanCount", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    const getData = await Loan.find({ status: false }).sort({ updatedAt: -1 });
    res.json({ getData, login: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Server Unavailable", type: "error", login: false });
  }
});

module.exports = router;
