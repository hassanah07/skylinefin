const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Loan = require("../model/Loan");
const Admin = require("../model/Admin");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");

const router = express.Router();

// get EMI Data from DATABASE
router.post("/personalLoanAgreement", fetchAdmin, async (req, res) => {
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
    let getData = await Loan.findById(req.body.id);
    res.json({ data: getData, status: true }); // getting corse error
  } catch (error) {
    res.status(500).json({ msg: "Server Unavailable", type: "error" });
  }
});

router.post("/customerDetails", fetchAdmin, async (req, res) => {
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
    let getData = await Customer.findOne({ customerId: req.body.customerId });
    res.json({ data: getData, status: true }); // getting corse error
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Unavailable", type: "error" });
  }
});

router.post("/getEmiDataWithLoanId", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let emiData = await Loan.findById(req.body.id);
    if (!emiData) {
      res.json({ msg: "No Data Found" }); // getting corse error
    } else {
      emiData = await Emi.findOne({
        loanAccountNumber: emiData.loanAccountNumber,
      });
      if (!emiData) {
        res.json({ data: emiData, status: true }); // getting corse error
      } else {
        res.json(emiData);
      }
    }
    // res.json({ data: emiData, status: true }); // getting corse error
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Unavailable", type: "error" });
  }
});

router.get("/emiData", async (req, res) => {
  const emiData = await Emi.find();
  console.log("first")
  res.json(emiData);
});
module.exports = router;
