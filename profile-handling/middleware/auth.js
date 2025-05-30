const jwt = require("jsonwebtoken");

const SECRET_JWT = "meranamhaianehswdjdhjbedhbwekhbdkbwedkbwkjjkbwjkcbskjbcjk";

function auth(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ msg: "Token is missing. Access denied." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT);
    if (decoded) {
      req.id = decoded.id;

      next();
    } else {
      res.status(401).json({ msg: "Invalid token. Access denied." });
    }
  } catch (err) {
    res
      .status(401)
      .json({ msg: "Invalid or expired token.", error: err.message });
  }
}

module.exports = {
  auth,
  SECRET_JWT,
};
