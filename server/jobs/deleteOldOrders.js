const cron = require("node-cron");

const Order = require("../models/Order");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    await Order.deleteMany({
      orderDate: {
        $ne: today,
      },
    });

    console.log("Old orders deleted successfully");
  } catch (error) {
    console.log(error);
  }
});
