const jwt = require("jsonwebtoken");
const fetchAdmin = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) {
      return res.status(403).json({ msg: "token not found" });
    } else {
      const data = await jwt.verify(token, process.env.JWT_SECRET);
      if (!data) {
        res.status(403).json({ msg: "Access Denied" });
      } else {
        req.admin = data.login;
        // res.status(200).json(req.user.id);
        // console.log(req.user.id);
        next();
      }
    }
  } catch (error) {
    res.status(500).json(false);
  }
};
module.exports = fetchAdmin;
