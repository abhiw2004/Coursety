const jwt = require("jsonwebtoken");

function getToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  if (req.headers.token) return String(req.headers.token).trim();
  return null;
}

function authRequired(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId || !decoded.role) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  const allowed = new Set(roles);
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (!allowed.has(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

function optionalAuth(req, _res, next) {
  try {
    const token = getToken(req);
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.userId && decoded.role) {
      req.user = { id: decoded.userId, role: decoded.role };
    }
  } catch {
    // ignore invalid token; treat as anonymous
  }
  next();
}

module.exports = { authRequired, requireRole, optionalAuth };
