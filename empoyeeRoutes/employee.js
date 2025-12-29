const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Admin = require("../model/Admin");
const Employee = require("../model/Employee");
const fetchEmp = require("../middleware/fetchEmp");

const router = express.Router();

router.post("/generateotp", async (req, res) => {
  const { email } = req.body;
  try {
    let emp = await Employee.findOne({ email });
    if (!emp) {
      return res.status(400).json({ msg: "Access Denied", type: "error" });
    }
    const otpId = Math.floor(10000 + Math.random() * 500000).toString();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 2 * 60 * 1000;
    // admin.otp = otp;
    // admin.otpExpiry = otpExpiry;
    await Employee.updateOne(
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
          subject: `New Login OTP with OTP ID: ${otpId} ✔`,
          html: `
        <h2><b>Dear Employee! Your Login OTP Has Been Generated and is valid for Two (02) Minutes</b></h2>
        <b>New Login OTP :</b><b><u>${otp}</u></b><br />
        <small>This is an auto generated email and do not share it with anyone</small>
        `,
        });
        res.status(200).json({ msg: "OTP Sent", type: "success" });
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
// generate login otp

// authenticate a admin using: POST "/api/auth/login". No login required
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const isMatch = await bcrypt.compare(password, employee.password);
    const otpCheck = req.body.otp;

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    if (
      employee.otp !== parseInt(otpCheck) ||
      employee.otpExpiry < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }
    // create and assign a token
    const payload = {
      employee: {
        id: employee.id,
        otp: employee.otp,
      },
    };
    const empToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const otpExpiry = Date.now();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Employee.updateOne(
      { email },
      { $set: { token: empToken, otpExpiry: otpExpiry } }
    );

    res.status(200).json({ empToken });
  } catch {
    return res.status(500).send("Internal Server Error");
  }
});
// get logged in admin details
// get user profile from server
router.post("/getEmployee",fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    const authUser = await Employee.findById(userId).select("-password");
    if (req.employee.otp !== authUser.otp)
      return res.status(403).json({ msg: "Access Denied", login: false });
    if (!authUser) {
      res.status(200).json({ msg: "Access Denied", login: false });
    } else {
      const employee = await Employee.findById(req.body.employeeId);
      if (!employee) {
        res
          .status(200)
          .json({ msg: "Employee is missing", login: true, redirect: true });
      } else {
        res.status(200).json({
          msg: "Employee Found",
          login: true,
          redirect: false,
          employee,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
// employee check by email id
router.post("/emailValidation", async (req, res) => {
  const { email } = req.body;
  try {
    let employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ msg: "Access Denied", type: "error" });
    }
    res
      .status(200)
      .json({ msg: "employee Validation Success!", type: "success" });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: "Internal Server Error", type: "error" });
  }
});
// reset password
router.post("/resetPassword", async (req, res) => {
  const userId = req.body.email;
  try {
    let authUser = await Employee.findOne({ email: userId });
    if (!authUser) {
      res.status(404).json({ msg: "Access Denied L1", login: false });
    } else {
      const salt = await bcrypt.genSalt(10);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let password = "";
      const length = 12;
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const hashedPassword = await bcrypt.hash(password, salt);
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
            subject: `New Login Password`,
            html: `
        <h2><b>Hello Employee! Your Login OTP Has Been Generated and is valid for Two (02) Minutes</b></h2>
        <b>New Login Password :</b><b><u>${password}</u></b><br />
        <small>This is an auto generated email for Extra security</small>
        `,
          });

          authUser = await Employee.findByIdAndUpdate(authUser._id, {
            $set: {
              password: hashedPassword,
            },
          });
          res
            .status(200)
            .json({ msg: "New Password Sent to Email!", login: true });
        }
        main().catch((error) => {
          res.status(500).json({ msg: "Unable To Send Email", type: "error" });
        });
      } catch (error) {
        res.status(500).json({ msg: "E-Mail Server Error", type: "error" });
      }
      // email shotting process end
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error", login: false });
  }
});
// profile details after login
router.post("/getemployeedetails", fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    const authUser = await Employee.findById(userId).select("-password");
    if (req.employee.otp !== authUser.otp)
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

module.exports = router;
