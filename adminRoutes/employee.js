const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/Auth");
const Admin = require("../model/Admin");
const fetchAdmin = require("../middleware/fetchAdmin");
const Employee = require("../model/Employee");

const router = express.Router();

router.post("/addEmployee", fetchAdmin, async (req, res) => {
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
    const employeeId = Number(
      ((Date.now() * 4000 + Math.floor(performance.now() * 5000)) % 1e8)
        .toString()
        .padStart(8, "0")
    );

    const checkEmployee = await Employee.findOne({ email: req.body.email });
    if (checkEmployee) {
      res.json({
        msg: "Employee Already Exists",
        status: false,
        empId: checkEmployee._id,
      });
    }
    {
      const addEmployee = await Employee.create({
        employeeId: employeeId,
        f_name: req.body.f_name,
        l_name: req.body.l_name,
        father: req.body.father,
        mother: req.body.mother,
        spouse: req.body.spouse,
        email: req.body.email,
        mobile: req.body.mobile,
        role: req.body.role,
        password: password,
        pan: req.body.pan,
        aadhar: req.body.aadhar,
        voter: req.body.voter,
        landmark: req.body.landmark,
        postalData: req.body.postalData,
        experiance: req.body.experiance,
        expDuration: req.body.expDuration,
      });
      res.status(200).json({
        empId: addEmployee._id,
        msg: "Employee Added Successfully",
        status: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error", status: false });
  }
});
// generate login otp
router.post("/generateotp", async (req, res) => {
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
router.post("/getEmployee", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (req.admin.otp !== authUser.otp)
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

// change state of employee
router.post("/makeActive", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (req.admin.otp !== authUser.otp)
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
        const changeState = await Employee.findByIdAndUpdate(
          req.body.employeeId,
          {
            $set: {
              status: true,
            },
          }
        );
        res.status(200).json({
          msg: "Employee is Activated",
          login: true,
          redirect: false,
          changeState,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.post("/makeDeactive", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const authUser = await Admin.findById(userId).select("-password");
    if (req.admin.otp !== authUser.otp)
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
        const changeState = await Employee.findByIdAndUpdate(
          req.body.employeeId,
          {
            $set: {
              status: false,
            },
          }
        );
        res.status(200).json({
          msg: "Employee is Deactivated",
          login: true,
          redirect: false,
          changeState,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
