import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import api from "../api/axios";
import { saveCustomerProfile } from "../utils/customerProfile";

// Utility function to load the Razorpay script dynamically
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// A token existing in localStorage doesn't mean it's still valid — JWTs
// carry their own expiry (`exp`, in seconds since epoch) inside the
// payload. Decode just that claim client-side (no network call, no new
// dependency) so we don't show "Student verified" for a token that's
// actually 8 days old and will be rejected the moment it hits the server.
const isTokenExpired = (token) => {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    // Malformed token — treat as expired/invalid so the user is asked to
    // log in again instead of silently getting stuck later.
    return true;
  }
};

function CheckoutModal({ items, cart, closeModal, clearCart, onOrderPlaced }) {
  const [pickupTime, setPickupTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerToken, setCustomerToken] = useState(() => {
    const token = localStorage.getItem("customerToken");
    if (token && !isTokenExpired(token)) return token;

    if (token) {
      localStorage.removeItem("customerToken");
      window.dispatchEvent(new Event("customer-auth-changed"));
    }
    return null;
  });

  const orderSummary = items.filter((item) => cart[item._id] > 0);
  const totalAmountToPay = orderSummary.reduce(
    (total, item) => total + item.price * cart[item._id],
    0,
  );

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("customerToken", res.data.token);
      saveCustomerProfile(res.data.user);
      window.dispatchEvent(new Event("customer-auth-changed"));
      setCustomerToken(res.data.token);
    } catch (error) {
      console.log(error);
      alert("Google Login Failed");
    }
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("customerToken");
      if (!token) {
        alert("Please login with Google.");
        setCustomerToken(null);
        return;
      }

      if (!pickupTime) {
        alert("Please select a specific pickup time");
        return;
      }

      // NEW: Strict frontend validation for time bounds
      if (pickupTime < "08:45" || pickupTime > "18:00") {
        alert(
          "Sorry, pickup times are only available between 08:45 AM and 06:00 PM.",
        );
        return;
      }

      setLoading(true);

      // Load Razorpay script securely before opening the modal
      const scriptLoaded = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const orderedItems = orderSummary.map((item) => ({
        itemId: item._id,
        quantity: cart[item._id],
      }));

      let data;
      try {
        const res = await api.post(
          "/api/payment/create-order",
          { pickupTime, items: orderedItems },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        data = res.data;
      } catch (error) {
        if (error.response?.status === 401) {
          // Covers both an expired token that slipped past the mount-time
          // check (e.g. it expired mid-session) and a token rejected for
          // any other reason — either way, stop showing "verified" for it.
          localStorage.removeItem("customerToken");
          window.dispatchEvent(new Event("customer-auth-changed"));
          setCustomerToken(null);
          alert(
            error.response?.data?.message ||
              "Session expired. Please login again.",
          );
          setLoading(false);
          return;
        }
        throw error;
      }

      const { razorpayOrder } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "VELAA CAFE",
        description: "Food Order Payment",
        order_id: razorpayOrder.id,
        webview_intent: true,
        handler: async function (response) {
          try {
            const verifyRes = await api.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            const orderData = {
              orderId: verifyRes.data.order._id,
              orderNumber: verifyRes.data.order.orderNumber,
              status: verifyRes.data.order.status,
            };

            clearCart();
            onOrderPlaced(orderData);
            closeModal();
          } catch (error) {
            console.log(error);
            const errorMsg = error.response?.data?.message;

            if (error.response?.status === 400 && errorMsg?.includes("left")) {
              alert(errorMsg);
              closeModal();
              clearCart();
              window.location.reload();
            } else if (error.response?.status === 401) {
              localStorage.removeItem("customerToken");
              window.dispatchEvent(new Event("customer-auth-changed"));
              setCustomerToken(null);
              alert(errorMsg || "Session expired. Please login again.");
            } else {
              alert(errorMsg || "Payment verification failed");
            }
          }
        },
        theme: { color: "#f97316" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#2a110a]/40 backdrop-blur-sm"
        onClick={closeModal}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-cafe-surface p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-cafe-border max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <h1 className="text-3xl font-black mb-6 text-cafe-text tracking-tight">
          Checkout
        </h1>

        {!customerToken ? (
          <div className="flex flex-col items-center gap-4 mb-2">
            <p className="text-cafe-muted font-medium text-center">
              Please verify your <b>SASTRA</b> email to continue.
            </p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Login Failed")}
            />
          </div>
        ) : (
          <>
            <div className="mb-6 p-3 rounded-2xl bg-green-50 text-green-700 font-semibold text-sm border border-green-200/50 flex items-center justify-center">
              Student verified successfully
            </div>

            <div className="bg-cafe-elevated p-5 rounded-2xl border border-cafe-border mb-6">
              <h3 className="text-cafe-text font-black mb-4 uppercase tracking-wider text-xs">
                Order Summary
              </h3>
              <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {orderSummary.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center text-sm font-medium text-cafe-muted"
                  >
                    <span className="truncate max-w-[200px]">
                      {item.name}
                      <span className="text-orange-500 font-bold ml-2">
                        x{cart[item._id]}
                      </span>
                    </span>
                    <span className="text-cafe-text font-bold shrink-0">
                      ₹{item.price * cart[item._id]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-cafe-border">
                <span className="font-bold text-cafe-muted uppercase text-xs tracking-wider">
                  Total to Pay
                </span>
                <span className="text-2xl font-black text-orange-500">
                  ₹{totalAmountToPay}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-cafe-muted mb-2 uppercase tracking-wide ml-2">
                  Select Exact Pickup Time (08:45 AM - 06:00 PM)
                </label>
                <input
                  type="time"
                  min="08:45"
                  max="18:00"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-cafe-elevated border border-cafe-border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-cafe-surface transition-all font-bold text-cafe-text text-xl cursor-pointer"
                  required
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-orange-500 text-white px-5 py-4 rounded-2xl w-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading
                  ? "Processing..."
                  : `Pay ₹${totalAmountToPay} Securely`}
              </button>
            </div>
          </>
        )}

        <button
          onClick={closeModal}
          className="mt-6 w-full text-cafe-muted font-bold hover:text-cafe-text transition-colors"
        >
          Cancel Order
        </button>
      </motion.div>
    </div>
  );
}

export default CheckoutModal;
