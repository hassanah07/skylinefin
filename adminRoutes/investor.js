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
router.post("/check", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (!authUser)
      return res
        .status(200)
        .json({ msg: "Internal Server Error", status: false, login: false });
    const checkInvestor = await Investor.findOne({ phone: req.body.phone });
    res
      .status(200)
      .json({ checkInvestor, msg: "Investor Not Found", status: false });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      status: false,
      login: false,
      error,
    });
  }
});

// add investor profile
router.post("/addInvestor", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (!authUser)
      return res.status(403).json({ msg: "Access Denied", login: false });
    const length = 12;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const investorId = Number(
      ((Date.now() * 4000 + Math.floor(performance.now() * 5000)) % 1e8)
        .toString()
        .padStart(8, "0")
    );
    let branchId;
    if (req.body.isBranch === true) {
      branchId = Number(
        ((Date.now() * 9000 + Math.floor(performance.now() * 3000)) % 1e8)
          .toString()
          .padStart(6, "0")
      );
    }

    const checkInvestor = await Investor.findOne({ email: req.body.email });
    if (checkInvestor) {
      res.json({
        msg: "Investor Already Exists",
        status: false,
        empId: checkInvestor._id,
      });
    } else {
      // console.log(req.body);
      const addInvestor = await Investor.create({
        investorId: investorId,
        title: req.body.title,
        firstName: req.body.f_name,
        lastName: req.body.l_name,
        father: req.body.fatherName,
        mother: req.body.motherName,
        spouse: req.body.spouseName,
        email: req.body.email,
        phone: req.body.mobile,
        dob: req.body.dob,
        password: password,
        pan: req.body.pan,
        aadhar: req.body.aadhar,
        voter: req.body.voter,
        address: req.body.landmark,
        landmark: req.body.landmark,
        postalData: req.body.postalData,
        amount: req.body.amount,
        createdBy: authUser._id,
        profitPercentage: req.body.profitPercentage,
      });
      res.status(200).json({
        invId: addInvestor._id,
        msg: "Investor Added Successfully",
        status: true,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, error });
  }
});
// GET INVESTOR PROFILE
router.post("/getInvestor", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (!authUser)
      return res.status(403).json({ msg: "Access Denied", login: false });

    const getInvestor = await Investor.find().sort({ updatedAt: -1 });
    if (getInvestor > 0) {
      res.json({ getInvestor, login: true });
    } else {
      res.json({ getInvestor, msg: "Investor Not Added Yet", login: true });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Internal Server Error",
      status: false,
      error,
      login: false,
    });
  }
});
// generate login otp
router.post("/generateOtp", async (req, res) => {
  const { email } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Access Denied", type: "error" });
    }
    const otpId = Math.floor(10000 + Math.random() * 500000).toString();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 2 * 60 * 1000;
    // admin.otp = otp;
    // admin.otpExpiry = otpExpiry;
    await Admin.updateOne(
      { email },
      {
        $set: {
          otp: otp,
          otpExpiry: otpExpiry,
        },
      }
    );
    // email shotting process start
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.forwardemail.net",
        port: 465,
        secure: true,
        service: "gmail",
        auth: {
          user: process.env.MAILER_USERID,
          pass: process.env.MAILER_PASSWORD,
        },
      });
      async function main() {
        const info = await transporter.sendMail({
          from: '"Server Mail"servermail@noreply.com',
          to: req.body.email,
          subject: `You Have a New Login OTP with OTP ID: ${otpId} ✔`,
          html: `
        <h2><b>Hello Admin! Your Login OTP Has Been Generated and is valid for Two (02) Minutes</b></h2>
        <b>New Login OTP :</b><b><u>${otp}</u></b><br />
        <small>This is an auto generated email for Extra security</small>
        `,
        });
        res
          .status(200)
          .json({ msg: "OTP Has Been Sent to Your Email", type: "success" });
      }
      main().catch((error) => {
        res.status(500).json({ msg: "Unable To Send Email", type: "error" });
      });
    } catch (error) {
      res.status(500).json({ msg: "E-Mail Server Error", type: "error" });
    }
    // email shotting process end
  } catch (error) {
    res.json({ msg: "Contact Developer", type: "error" });
  }
});
// authenticate a admin using: POST "/api/auth/login". No login required
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    const otpCheck = req.body.otp;

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    if (admin.otp !== parseInt(otpCheck) || admin.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    // create and assign a token
    const payload = {
      admin: {
        id: admin.id,
        otp: admin.otp,
      },
    };
    const authtoken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    await Admin.updateOne({ email }, { $set: { token: authtoken } });

    res.status(200).json({ authtoken });
  } catch {
    return res.status(500).send("Internal Server Error");
  }
});
// get logged in admin details
// get user profile from server
router.post("/getInvestorDetail", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (req.admin.otp !== authUser.otp)
      return res.status(403).json({ msg: "Access Denied", login: false });
    if (!authUser) {
      res.status(200).json({ msg: "Access Denied", login: false });
    } else {
      res.status(200).json({ authUser, login: true });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
// admin check by email id
router.post("/emailValidation", async (req, res) => {
  const { email } = req.body;
  try {
    let admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ msg: "Access Denied", type: "error" });
    }
    res.status(200).json({ msg: "Admin Validation Success!", type: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Internal Server Error", type: "error" });
  }
});

module.exports = router;
