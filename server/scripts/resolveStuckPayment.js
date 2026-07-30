// One-off recovery tool for a payment that Razorpay shows as captured, but
// that never turned into an Order (still sitting in the pendingpayments
// collection). Once the webhook (server.js + paymentController.js) is
// deployed, this shouldn't be needed for future payments — this is only
// for cleaning up ones stuck from BEFORE that fix went live.
//
// Usage:
//   cd server
//   node scripts/resolveStuckPayment.js <razorpay_order_id> <razorpay_payment_id>
//
// Find both IDs in the Razorpay Dashboard → Payments → click the payment.
// razorpay_order_id looks like "order_XXXXXXXXXXXXXX", razorpay_payment_id
// looks like "pay_XXXXXXXXXXXXXX".
//
// IMPORTANT: only run this for a payment you've confirmed shows as
// "Captured" in the Razorpay Dashboard. This script does not itself verify
// with Razorpay that the payment succeeded — it trusts the IDs you give it.

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { finalizePendingPayment } = require("../controllers/paymentController");

const [, , razorpayOrderId, razorpayPaymentId] = process.argv;

if (!razorpayOrderId || !razorpayPaymentId) {
  console.error(
    "Usage: node scripts/resolveStuckPayment.js <razorpay_order_id> <razorpay_payment_id>",
  );
  process.exit(1);
}

(async () => {
  try {
    await connectDB();

    const result = await finalizePendingPayment(
      razorpayOrderId,
      razorpayPaymentId,
    );

    switch (result.status) {
      case "paid":
        console.log(
          `✅ Order created (paymentStatus: PAID). Order number: ${result.order.orderNumber}, id: ${result.order._id}`,
        );
        break;
      case "refund_required":
        console.log(
          `⚠️  Order created but flagged REFUND_REQUIRED (the reservation had already expired and stock was released before this payment was recovered). Order id: ${result.order._id}. You'll need to manually refund this one via the Razorpay Dashboard.`,
        );
        break;
      case "already_processed":
        console.log(
          `ℹ️  An order already exists for this razorpay_order_id (id: ${result.order._id}, status: ${result.order.paymentStatus}). Nothing to do.`,
        );
        break;
      case "not_found":
        console.error(
          "❌ No PendingPayment found for that razorpay_order_id, and no Order exists for it either. Double-check the order id, or this payment may already have been cleaned up / never reserved stock in the first place.",
        );
        break;
      case "user_not_found":
        console.error(
          "❌ The PendingPayment's userId doesn't match any User in the database. This shouldn't normally happen — investigate manually.",
        );
        break;
      default:
        console.error("Unexpected result:", result);
    }
  } catch (error) {
    console.error("Failed to resolve stuck payment:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
