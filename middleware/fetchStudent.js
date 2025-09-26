const jwt = require("jsonwebtoken");
const fetchStudent = async (req, res, next) => {
  try {
    const token = req.header("learnerToken");
    if (!token) {
      res.status(403).json({ status: false, msg: "token not found" });
    } else {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      if (!data) {
        res.status(403).json({ status: false, msg: "Access Denied" });
      } else {
        req.student = data.student;
        next();
      }
    }
  } catch (error) {
    res.status(500).json({ status: false, msg: "Login Session Expired" });
    // res.status(500).json(error);
  }
};
module.exports = fetchStudent;
