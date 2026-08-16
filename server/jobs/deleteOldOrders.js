const cron = require("node-cron");
const Counter = require("../models/Counter");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).split('/').reverse().join('-');

    // Orders are permanent records. Daily counters are only needed to
    // generate today's display sequence, so old counter documents can be
    // safely discarded without affecting order history.
    await Counter.deleteMany({
      date: {
        $ne: today,
      },
    });

    console.log("Old counters deleted successfully for date:", today);
  } catch (error) {
    console.error("Failed to delete old counters:", error);
  }
});
