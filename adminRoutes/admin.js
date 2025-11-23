const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/Auth");
const Admin = require("../model/Admin");
const fetchAdmin = require("../middleware/fetchAdmin");

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
      const otpId = Math.floor(10000 + Math.random() * 500000).toString();

      admin = await Admin.create({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: hashedPassword,
      });
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
            subject: `You are Assigned as Admin: ${otpId} ✔`,
            html: `
        <h2><b>Congratulation! You area assigned as an Admin at Skyline E-Finance PVT LTD</b></h2>
        <b>New Login ID is :</b><b><u>${req.body.email}</u></b><br />
        <b>New Password is :</b><b><u>${randPassword}</u></b><br />
        <small>you can use this email is to login at your Admin Portal</small>
        <small>This is an auto generated email for Extra security</small>
        <small>With Regards @www.skylineefinance.com</small>
        `,
          });
          res
            .status(200)
            .json({ msg: "OTP Has Been Sent to Your Email", type: "success" });
        }
        main().catch((error) => {
          console.log(error);
          res.status(500).json({ msg: "Unable To Send Email", type: "error" });
        });
      } catch (error) {
        res.status(500).json({ msg: "E-Mail Server Error", type: "error" });
      }
      // res
      //   .status(201)
      //   .json({ status: true, msg: "account created!", admin, randPassword });
    }
  } catch (error) {
    res.json(error);
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
router.post("/getadmindetail", fetchAdmin, async (req, res) => {
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
// change password
router.post("/changePassword", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let authUser = await Admin.findById(userId);
    if (req.admin.otp !== authUser.otp)
      return res.status(403).json({ msg: "Access Denied L1", login: true });
    if (!authUser) {
      res.status(200).json({ msg: "Access Denied L2", login: true });
    } else {
      const currentPassword = req.body.currentPassword;
      const userPassword = req.body.newPassword;
      const isMatch = await bcrypt.compare(currentPassword, authUser.password);

      if (!isMatch) {
        res.status(200).json({ msg: "Access Denied L3", login: true });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userPassword, salt);
        authUser = await Admin.findByIdAndUpdate(authUser._id, {
          $set: {
            password: hashedPassword,
          },
        });
        res.status(200).json({ msg: "Password Changed!", login: false });
      }
    }
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error", login: true });
  }
});
router.post("/resetPassword", async (req, res) => {
  const userId = req.body.email;
  try {
    let authUser = await Admin.findOne({ email: userId });
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
        <h2><b>Hello Admin! Your Login OTP Has Been Generated and is valid for Two (02) Minutes</b></h2>
        <b>New Login Password :</b><b><u>${password}</u></b><br />
        <small>This is an auto generated email for Extra security</small>
        `,
          });

          authUser = await Admin.findByIdAndUpdate(authUser._id, {
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

module.exports = router;
