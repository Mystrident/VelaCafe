const webpush = require("web-push");
const Admin = require("../models/Admin");

const configureWebPush = () => {
  const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_SUBJECT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return false;
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  return true;
};

const getPublicKey = () => {
  if (!configureWebPush()) return null;
  return process.env.VAPID_PUBLIC_KEY;
};

const saveSubscription = async (adminId, subscription) => {
  const existing = await Admin.findById(adminId).select("pushSubscriptions");
  if (!existing) return null;

  existing.pushSubscriptions = existing.pushSubscriptions.filter(
    (item) => item.endpoint !== subscription.endpoint,
  );
  existing.pushSubscriptions.push({
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: subscription.keys,
  });
  await existing.save();
  return existing;
};

const sendOrderPushNotification = async (order) => {
  if (!configureWebPush()) {
    console.warn("Web Push is not configured; order push notification skipped.");
    return;
  }

  const admins = await Admin.find({ "pushSubscriptions.0": { $exists: true } })
    .select("pushSubscriptions");
  const payload = JSON.stringify({
    title: `New order #${String(order.orderNumber).padStart(3, "0")}`,
    body: `${order.userName} · Pickup ${order.pickupTime} · ₹${order.totalAmount}`,
    url: "/orders",
  });

  await Promise.all(
    admins.flatMap((admin) =>
      admin.pushSubscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription.toObject(), payload);
        } catch (error) {
          // A browser returns 404/410 after a subscription has expired or
          // been revoked; remove only that stale device registration.
          if (error.statusCode === 404 || error.statusCode === 410) {
            await Admin.updateOne(
              { _id: admin._id },
              { $pull: { pushSubscriptions: { endpoint: subscription.endpoint } } },
            );
            return;
          }
          throw error;
        }
      }),
    ),
  );
};

module.exports = { getPublicKey, saveSubscription, sendOrderPushNotification };
