import { useState, useEffect } from "react";

import { GoogleLogin } from "@react-oauth/google";

import api from "../api/axios";

function CheckoutModal({ items, cart, closeModal, clearCart }) {
  const [pickupTime, setPickupTime] = useState("");

  const [loading, setLoading] = useState(false);

  const [customerToken, setCustomerToken] = useState(null);

  const [orderSuccess, setOrderSuccess] = useState(false);

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

      localStorage.setItem(
        "customerToken",
        res.data.token
      );

      setCustomerToken(res.data.token);
    } catch (error) {
      console.log(error);

      alert("Google Login Failed");
    }
  };

  const handlePayment = async () => {
    try {
      if (!customerToken) {
        alert("Please login with Google");
        return;
      }

      if (!pickupTime) {
        alert("Please enter pickup time");
        return;
      }

      setLoading(true);

      const orderedItems = items
        .filter((item) => cart[item._id] > 0)
        .map((item) => ({
          itemId: item._id,
          quantity: cart[item._id],
        }));

      const { data } = await api.post(
        "/api/payment/create-order",
        {
          pickupTime,
          items: orderedItems,
        }
      );

      const {
        razorpayOrder,
        validatedItems,
        totalAmount,
      } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: razorpayOrder.amount,

        currency: "INR",

        name: "VELAA CAFE",

        description: "Food Order Payment",

        order_id: razorpayOrder.id,

        handler: async function (response) {
          try {
            await api.post(
              "/api/payment/verify-payment",
              {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                pickupTime,

                items: validatedItems,

                totalAmount,
              },
              {
                headers: {
                  Authorization: `Bearer ${customerToken}`,
                },
              }
            );

              setOrderSuccess(true);

              clearCart();
          } catch (error) {
            console.log("VERIFY PAYMENT ERROR:", error);

            console.log(
              "SERVER RESPONSE:",
              error.response?.data
            );

            alert(
              error.response?.data?.message ||
              "Payment verification failed"
            );
          }
        },

        theme: {
          color: "#f97316",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
if (orderSuccess) {
  return (
    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        justify-center
        items-center
        z-50
      "
    >
      <div
        className="
          bg-white
          p-8
          rounded-3xl
          max-w-md
          w-full
          text-center
        "
      >
        <h2
          className="
            text-3xl
            font-bold
            text-green-600
            mb-4
          "
        >
          Order Placed Successfully 🎉
        </h2>

        <p className="text-gray-600 mb-6">
          Your payment was successful and your order has been placed.
        </p>

        <button
          onClick={closeModal}
          className="
            bg-orange-500
            text-white
            px-6
            py-3
            rounded-2xl
            font-bold
          "
        >
          OK
        </button>
      </div>
    </div>
  );
}
  return (
    <div
      className="
        fixed
        inset-0
        bg-black/50
        flex
        justify-center
        items-center
        z-50
        px-4
      "
    >
      <div
        className="
          bg-white
          p-8
          rounded-3xl
          w-full
          max-w-md
        "
      >
        <h1
          className="
            text-3xl
            font-bold
            mb-6
            text-[#4b1e14]
          "
        >
          Checkout
        </h1>

        {!customerToken ? (
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                alert("Google Login Failed")
              }
            />
          </div>
        ) : (
          <>
            <div
              className="
                mb-5
                p-4
                rounded-2xl
                bg-green-50
                border
                border-green-200
              "
            >
              Logged in successfully
            </div>

            <input
              type="text"
              placeholder="Pickup Time"
              value={pickupTime}
              onChange={(e) =>
                setPickupTime(e.target.value)
              }
              className="
                w-full
                border
                p-4
                rounded-2xl
                mb-5
                outline-none
                focus:ring-2
                focus:ring-orange-400
              "
            />

            <button
              onClick={handlePayment}
              disabled={loading}
              className="
                bg-orange-500
                text-white
                px-5
                py-4
                rounded-2xl
                w-full
                mt-4
                font-bold
                text-lg
                hover:bg-orange-600
                transition
                disabled:opacity-50
              "
            >
              {loading
                ? "Processing..."
                : "Pay Now"}
            </button>
          </>
        )}

        <button
          onClick={closeModal}
          className="
            mt-4
            w-full
            text-gray-600
            hover:text-black
            transition
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CheckoutModal;