const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/Auth");
const Admin = require("../model/Admin");
const fetchAdmin = require("../middleware/fetchAdmin");
const Dealer = require("../model/Dealer");
const fetchEmp = require("../middleware/fetchEmp");

const router = express.Router();

// create new dealer
router.post("/createdealer", fetchEmp, async (req, res) => {
  const userId = req.admin.id;
  try {
    let dealer = await Dealer.findOne({ email: req.body.email });
    if (dealer) {
      res.status(400).json({ msg: "Oppssss! Account Already Exist" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const randPassword = `PMX${Math.floor(Math.random() * 10000000)}`;
      const hashedPassword = await bcrypt.hash(randPassword, salt);
      const otpId = Math.floor(10000 + Math.random() * 500000).toString();
      const dealerId = Math.floor(10000 + Math.random() * 3256454).toString();

      dealer = await Dealer.create({
        dealerId: dealerId,
        title: req.body.title,
        name: req.body.name,
        father: req.body.father,
        pan: req.body.pan,
        aadhar: req.body.aadhar,
        email: req.body.email,
        mobile: req.body.mobile,
        address: req.body.address,
        landmark: req.body.landmark,
        postalData: req.body.postalData,
        password: hashedPassword,
        location: req.body.location,
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
            subject: `You are Assigned as Dealer: ${otpId} ✔`,
            html: `
        <h2><b>Congratulation! You area assigned as a Dealer at Skyline Fynum Small Finance PVT LTD</b></h2>
        <b>New Login ID is :</b><b><u>${req.body.email}</u></b><br />
        <b>New Password is :</b><b><u>${randPassword}</u></b><br />
        <small>you can use this email is to login at your Login Portal</small>
        <small>This is an auto generated email for Extra security</small>
        <small>With Regards @www.skylineefinance.com</small>
        `,
          });
          res
            .status(200)
            .json({ msg: "Dealer Created", type: "success", status: true });
        }
        main().catch((error) => {
          console.log(error);
          res.status(500).json({
            msg: "Unable To Send Email",
            type: "error",
            status: false,
          });
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
// get all dealer/ marchant
router.post("/getDealer", fetchEmp, async (req, res) => {
  const userId = req.employee.id;
  try {
    let dealer = await Dealer.find();
    res.json({ msg: "Ok", dealer });
  } catch (error) {
    res.json(error);
  }
});
// get dealer with dealer id
router.post("/getDealerWithDealerId", fetchEmp, async (req, res) => {
  try {
    let dealer = await Dealer.findById(req.body.id);
    res.json({ msg: "Ok", dealer });
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
