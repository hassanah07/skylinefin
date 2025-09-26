const jwt = require("jsonwebtoken");

const fetchMentor = async (req, res, next) => {
  try {
    const token = req.header("mentorToken");
    if (!token) {
      res.status(403).json({ status: false, msg: "token not found" });
    } else {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      if (!data) {
        res.status(403).json({ status: false, msg: "Access Denied" });
      } else {
        req.mentor = data.mentor;
        // res.status(200).json(req.user.id);
        // console.log(req.user.id);
        next();
      }
    }
  } catch (error) {
    res.status(500).json({ status: false, msg: "Login Session Expired" });
    // res.status(500).json(error);
  }
};
module.exports = fetchMentor;
