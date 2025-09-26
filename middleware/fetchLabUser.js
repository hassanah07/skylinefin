const jwt = require("jsonwebtoken");
const fetchLabUser = async (req, res, next) => {
  try {
    const token = req.header("labUserToken");
    if (!token) {
      res.status(403).json({ status: false, msg: "Access Denied" });
    } else {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      if (!data) {
        res.status(403).json({ status: false, msg: "Access Denied1" });
      } else {
        req.keeper = data.keeper;
        // console.log(req.keeper);
        next();
      }
    }
  } catch (error) {
    res.status(500).json({ status: false, msg: "Access Tempered" });
  }
};
module.exports = fetchLabUser;
