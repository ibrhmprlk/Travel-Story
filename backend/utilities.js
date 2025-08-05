// utilities.js veya authenticateToken.js


const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(401);
    req.user = { userId: decoded.userId }; // 🔥 ÖNEMLİ KISIM
    next();
  });
}

module.exports = { authenticateToken };
