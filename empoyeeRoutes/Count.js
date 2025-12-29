const express = require("express");
const nodemailer = require("nodemailer");
const Loan = require("../model/Loan");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");
const Employee = require("../model/Employee");
const fetchEmp = require("../middleware/fetchEmp");

const router = express.Router();

// get EMI Data from DATABASE
router.post("/customerCount", fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    let employee = await Employee.findById(userId);
    if (employee === null) {
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
router.post("/employeeCount", fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    let employee = await Employee.findById(userId);
    if (employee === null) {
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
router.post("/loanCount", fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    let employee = await Employee.findById(userId);
    if (employee === null) {
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
router.post("/pendingLoanCount", fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    let employee = await Employee.findById(userId);
    if (employee === null) {
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
