const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No Token",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "secretkey");

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};

module.exports = protect;
