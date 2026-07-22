const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only tokens explicitly issued for admins are accepted here.
    // (Customer tokens carry role "customer" and must never pass.)
    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Admin access only",
      });
    }

    const admin = await Admin.findById(decoded.id).select("_id");

    if (!admin) {
      return res.status(401).json({
        message: "Admin no longer exists",
      });
    }

    req.admin = { id: admin._id };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = protect;
