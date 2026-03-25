require("dotenv").config();
const jwt = require("jsonwebtoken");
function adminMiddleWare(req, res, next) {
  try {
    const token =
      req.headers.token || req.headers.authorization?.replace("Bearer ", "");
    if (!token)
      return res.status(403).json({ message: "Admin does not exist" });
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch {
    res.status(403).json({ message: "Admin does not exist" });
  }
}
module.exports = {
  adminMiddleWare,
};
