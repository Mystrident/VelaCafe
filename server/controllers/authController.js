const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const admin = await Admin.findOne({
      username,
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.json({
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        process.env.NODE_ENV === "development" ? error.message : "Server error",
    });
  }
};

module.exports = {
  loginAdmin,
};
