const express = require("express");
const Company = require("../model/Company");
const fetchEmp = require("../middleware/fetchEmp");

const router = express.Router();

router.post("/getCompany", fetchEmp, async (req, res) => {
  try {
    const company = await Company.find();
    res.json({ company });
  } catch (error) {
    res.status(500).json({ msg: "Contact Developer" });
  }
});

module.exports = router;
