const jwt = require("jsonwebtoken");
const fetchEmp = async (req, res, next) => {
  try {
    const token = req.header("emp-token");
    if (!token) {
      return res.status(403).json({ msg: "token not found" });
    } else {
      const data = await jwt.verify(token, process.env.JWT_SECRET);
      if (!data) {
        res.status(403).json({ msg: "Access Denied" });
      } else {
        req.employee = data.employee;
        next();
      }
    }
  } catch (error) {
    res.status(500).json({ error, login: false, msg: "User Validation Error" });
  }
};
module.exports = fetchEmp;
