import { useState } from "react";

import api from "../api/axios";

function CheckoutModal({ items, cart, closeModal, clearCart }) {
  const [customerName, setCustomerName] = useState("");

  const [department, setDepartment] = useState("");

  const [pickupTime, setPickupTime] = useState("");

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      if (!customerName || !department || !pickupTime) {
        alert("Please fill all fields");

        return;
      }

      setLoading(true);

      const orderedItems = items
        .filter((item) => cart[item._id] > 0)
        .map((item) => ({
          itemId: item._id,
          quantity: cart[item._id],
        }));

      const { data } = await api.post("/payment/create-order", {
        customerName,
        department,
        pickupTime,
        items: orderedItems,
      });

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
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,

              customerName,

              department,

              pickupTime,

              items: validatedItems,

              totalAmount,
            });

            alert("Payment Successful & Order Placed");

            clearCart();

            closeModal();
          } catch (error) {
            console.log(error);

            alert("Payment verification failed");
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

        <input
          type="text"
          placeholder="Your Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
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

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
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

        <input
          type="text"
          placeholder="Pickup Time"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
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
          {loading ? "Processing..." : "Pay Now"}
        </button>

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
