const jwt = require("jsonwebtoken");
const fetchUser = (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(404).json({ msg: "token not found" });
    } else {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      if (!data) {
        res.status(403).json({ msg: "Access Denied" });
      } else {
        req.admin = data.admin;
        next();
      }
    }
  } catch (error) {
    res.status(500).json(false);
  }
};
module.exports = fetchUser;
