const cron = require("node-cron");
const mongoose = require("mongoose");
const PendingPayment = require("../models/PendingPayment");
const Item = require("../models/Item");

// How long we keep an already-released PendingPayment document around
// before permanently deleting it. This grace period is what lets
// verifyPayment still detect a very-late payment that lands right after
// its reservation expired (see the `pending.released` branch in
// verifyPayment) and flag it for a manual refund instead of losing all
// record of what the money was for.
const RELEASED_RECORD_RETENTION_HOURS = 24;

let ioRef = null;
// server.js calls this once at startup so this job can emit socket
// updates the same way the controllers do.
const attachIo = (io) => {
  ioRef = io;
};

const releaseExpiredReservations = async () => {
  const now = new Date();

  // Step 1: find reservations that timed out without a completed payment,
  // put their stock back, and mark them released (not deleted yet).
  const expired = await PendingPayment.find({
    expiresAt: { $lte: now },
    released: false,
  });

  for (const pending of expired) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Re-check inside the transaction that nobody has already resolved
      // this reservation (e.g. verifyPayment finalizing it) between the
      // find() above and now.
      const stillPending = await PendingPayment.findOne(
        { _id: pending._id, released: false },
        null,
        { session }
      );
      if (!stillPending) {
        await session.abortTransaction();
        session.endSession();
        continue;
      }

      for (const purchasedItem of stillPending.items) {
        await Item.findByIdAndUpdate(
          purchasedItem.itemId,
          { $inc: { stock: purchasedItem.quantity } },
          { session }
        );
      }

      stillPending.released = true;
      stillPending.releasedAt = now;
      await stillPending.save({ session });

      await session.commitTransaction();
      session.endSession();

      if (ioRef) {
        for (const purchasedItem of stillPending.items) {
          const updated = await Item.findById(purchasedItem.itemId);
          if (updated) {
            ioRef.emit("stock-updated", {
              itemId: updated._id,
              newStock: updated.stock,
            });
          }
        }
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(
        `Failed to release expired reservation ${pending._id}:`,
        error
      );
    }
  }

  // Step 2: permanently delete released reservations past their retention
  // window. By this point any late-arriving payment for them has long
  // since been handled (or genuinely never came in).
  const cutoff = new Date(
    now.getTime() - RELEASED_RECORD_RETENTION_HOURS * 60 * 60 * 1000
  );
  await PendingPayment.deleteMany({
    released: true,
    releasedAt: { $lte: cutoff },
  });
};

// Runs every minute — reservations are only held for ~10 minutes, so this
// keeps the delay between "someone abandons checkout" and "stock is back
// on sale for everyone else" short.
cron.schedule("* * * * *", async () => {
  try {
    await releaseExpiredReservations();
  } catch (error) {
    console.error("releaseExpiredReservations job failed:", error);
  }
});

module.exports = { attachIo, releaseExpiredReservations };
