const Admin = require("../models/Admin");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("DB Name:", Admin.db.name);

    console.log(
      "Username received:",
      JSON.stringify(username)
    );

    const allAdmins = await Admin.find();
    console.log("All admins:", allAdmins);

    const admin = await Admin.findOne({
      username,
    });

    console.log("Admin found:", admin);

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
};
