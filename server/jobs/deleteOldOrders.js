const cron = require("node-cron");

const Order = require("../models/Order");
const Counter = require("../models/Counter");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

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

    console.log("Old orders and counters deleted successfully");
  } catch (error) {
    console.error(error);
  }
});
