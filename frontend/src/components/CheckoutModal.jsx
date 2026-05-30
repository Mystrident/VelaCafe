import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import api from "../api/axios";

function CheckoutModal({ items, cart, closeModal, clearCart, onOrderPlaced }) {
  const [pickupTime, setPickupTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerToken, setCustomerToken] = useState(null);

  // 🔴 NEW: Calculate the Order Summary
  const orderSummary = items.filter((item) => cart[item._id] > 0);
  const totalAmountToPay = orderSummary.reduce(
    (total, item) => total + item.price * cart[item._id],
    0
  );

  useEffect(() => {
    const token = localStorage.getItem("customerToken");
    if (token) {
      setCustomerToken(token);
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("customerToken", res.data.token);
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
        alert("Please login with Google");
        setCustomerToken(null);
        return;
      }

      if (!pickupTime) {
        alert("Please select a specific pickup time");
        return;
      }

      setLoading(true);

      const orderedItems = orderSummary.map((item) => ({
        itemId: item._id,
        quantity: cart[item._id],
      }));

      const { data } = await api.post(
        "/api/payment/create-order",
        { pickupTime, items: orderedItems },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { razorpayOrder, validatedItems, totalAmount } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "VELAA CAFE",
        description: "Food Order Payment",
        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {
            const verifyRes = await api.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                pickupTime,
                items: validatedItems,
                totalAmount,
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

            localStorage.setItem("activeOrder", JSON.stringify(orderData));
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
              setCustomerToken(null);
              alert("Session expired. Please login again.");
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
      alert(error.response?.data?.message || "Something went wrong");
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
        className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 border border-gray-100 max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <h1 className="text-3xl font-black mb-6 text-[#3a1710] tracking-tight">Checkout</h1>

        {!customerToken ? (
          <div className="flex flex-col items-center gap-4 mb-2">
            <p className="text-gray-500 font-medium text-center">Please verify your SASTRA student email to continue.</p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Login Failed")}
            />
          </div>
        ) : (
          <>
            <div className="mb-6 p-3 rounded-2xl bg-green-50 text-green-700 font-semibold text-sm border border-green-200/50 flex items-center justify-center">
              Student verified successfully ✓
            </div>

            {/* 🔴 NEW: Order Summary Box */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6">
              <h3 className="text-[#3a1710] font-black mb-4 uppercase tracking-wider text-xs">Order Summary</h3>
              
              <div className="space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {orderSummary.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-sm font-medium text-gray-600">
                    <span className="truncate max-w-[200px]">
                      {item.name} 
                      <span className="text-orange-500 font-bold ml-2">x{cart[item._id]}</span>
                    </span>
                    <span className="text-[#3a1710] font-bold shrink-0">
                      ₹{item.price * cart[item._id]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-500 uppercase text-xs tracking-wider">Total to Pay</span>
                <span className="text-2xl font-black text-orange-500">₹{totalAmountToPay}</span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide ml-2">
                  Select Exact Pickup Time
                </label>
                
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all font-bold text-[#3a1710] text-xl cursor-pointer"
                  required
                />
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="bg-orange-500 text-white px-5 py-4 rounded-2xl w-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Processing..." : `Pay ₹${totalAmountToPay} Securely`}
              </button>
            </div>
          </>
        )}

        <button
          onClick={closeModal}
          className="mt-6 w-full text-gray-400 font-bold hover:text-[#3a1710] transition-colors"
        >
          Cancel Order
        </button>
      </motion.div>
    </div>
  );
}

export default CheckoutModal;