require("dotenv").config()
const jwt = require("jsonwebtoken")
function userMiddleWare(req,res,next){
  try {
    const token = req.headers.token || req.headers.authorization?.replace("Bearer ","")
    if(!token) return res.status(403).json({ message: "You are not signed in" })
    const decoded = jwt.verify(token,process.env.USER_JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch {
    res.status(403).json({ message: "You are not signed in" })
  }
}
module.exports = {
    userMiddleWare
}