const cron = require("node-cron");
const Order = require("../models/Order");
const Counter = require("../models/Counter");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).split('/').reverse().join('-');

    await Order.deleteMany({
      orderDate: {
        $ne: today,
      },
    });

    await Counter.deleteMany({
      date: {
        $ne: today,
      },
    });

    console.log("Old orders and counters deleted successfully for date:", today);
  } catch (error) {
    console.error("Failed to delete old orders:", error);
  }
});