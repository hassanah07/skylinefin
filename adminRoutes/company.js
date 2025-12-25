const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const User = require("../model/Auth");
const Admin = require("../model/Admin");
const fetchAdmin = require("../middleware/fetchAdmin");
const Company = require("../model/Company");

const router = express.Router();
router.post("/addCompany", fetchAdmin, async (req, res) => {
  try {
    const company = await Company.find();
    const myCompany = company[0];

    if (myCompany !== null) {
      const update = await Company.findByIdAndUpdate(myCompany._id, {
        name: req.body.name,
        cinNo: req.body.cinNo,
        address: req.body.address,
        pan: req.body.pan,
        tan: req.body.tan,
        incDate: req.body.incDate,
        type: req.body.type,
        field: req.body.field,
        link: req.body.link,
      });
      res.json({ update, msg: "updated" });
    } else {
      const company = await Company.create({
        name: req.body.name,
        cinNo: req.body.cinNo,
        address: req.body.address,
        pan: req.body.pan,
        tan: req.body.tan,
        incDate: req.body.incDate,
        type: req.body.type,
        field: req.body.field,
        link: req.body.link,
      });
      res.json({ company, msg: "detail added", status: true });
    }
  } catch (error) {
    res.status(500).json({ msg: "Contact Developer", status: false });
  }
});
router.post("/getCompany", fetchAdmin, async (req, res) => {
  try {
    const company = await Company.find();
    res.json({ company });
  } catch (error) {
    res.status(500).json({ msg: "Contact Developer" });
  }
});

module.exports = router;
