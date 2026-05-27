const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

require("dotenv").config();

const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI);

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  const admin = new Admin({
    username: "admin",
    password: hashedPassword,
  });

  await admin.save();

  console.log("Admin Created");

  process.exit();
};

createAdmin();
