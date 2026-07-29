const jwt = require("jsonwebtoken");
const User = require("../models/User");

const customerProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "customer") {
      return res.status(403).json({
        message: "Customer access only",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = {
      id: user._id,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please login again.",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      message: "Invalid token",
      code: "TOKEN_INVALID",
    });
  }
};

module.exports = customerProtect;
