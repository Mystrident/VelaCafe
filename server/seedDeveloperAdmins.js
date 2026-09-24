require("dotenv").config();

const mongoose = require("mongoose");
const dns = require("dns");
const Admin = require("./models/Admin");

// Match the connection setup used by server/config/db.js. MongoDB's SRV
// hostname is not resolving reliably through the default local DNS resolver.
dns.setServers(["8.8.8.8"]);

const accounts = [
  {
    username: "developer1",
    passwordHash: "$2b$10$PiH/uFpoU0T9LYtgHz/9Be0TgXmNT1jndSllo6eyiJ2Ji79mb432u",
  },
  {
    username: "developer2",
    passwordHash: "$2b$10$7IT8nthrgt24HM6W17cGu.DkVp8XwdE5OOGKeYbu4e9mal8kIumve",
  },
];

const seedDeveloperAdmins = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  for (const account of accounts) {
    const existing = await Admin.findOne({ username: account.username });
    if (existing) {
      console.log(`${account.username} already exists; leaving it unchanged.`);
      continue;
    }

    await Admin.create({
      username: account.username,
      password: account.passwordHash,
    });
    console.log(`${account.username} created.`);
  }
};

seedDeveloperAdmins()
  .catch((error) => {
    console.error("Failed to seed developer admins:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
