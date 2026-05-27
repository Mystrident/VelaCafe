import { useState } from "react";

import api from "../api/axios";

function CheckoutModal({ items, cart, totalAmount, closeModal, clearCart }) {
  const [customerName, setCustomerName] = useState("");

  const [department, setDepartment] = useState("");

  const [pickupTime, setPickupTime] = useState("");

  const [paymentScreenshot, setPaymentScreenshot] = useState(null);

  const handleOrder = async () => {
    try {
      const orderedItems = items
        .filter((item) => cart[item._id] > 0)
        .map((item) => ({
          itemId: item._id,
          name: item.name,
          quantity: cart[item._id],
          price: item.price,
        }));

      const formData = new FormData();

      formData.append("customerName", customerName);

      formData.append("department", department);

      formData.append("pickupTime", pickupTime);

      formData.append("items", JSON.stringify(orderedItems));

      formData.append("totalAmount", totalAmount);

      formData.append("paymentScreenshot", paymentScreenshot);

      await api.post("/orders", formData);

      alert("Order Placed");

      clearCart();

      closeModal();
    } catch (error) {
      console.log(error);
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
      "
    >
      <div
        className="
          bg-white
          p-8
          rounded-3xl
          w-[400px]
        "
      >
        <h1
          className="
            text-3xl
            font-bold
            mb-6
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

        <p
          className="
            mb-3
            font-semibold
          "
        >
          Upload Payment Screenshot
        </p>

        <label
          className="
            flex
            items-center
            justify-center
            w-full
            py-4
            rounded-2xl
            bg-orange-500
            text-white
            font-bold
            cursor-pointer
            shadow-lg
            shadow-orange-300
            hover:scale-105
            hover:bg-orange-600
            transition
            duration-300
          "
        >
          Choose Screenshot
          <input
            type="file"
            onChange={(e) => setPaymentScreenshot(e.target.files[0])}
            className="hidden"
          />
        </label>

        {paymentScreenshot && (
          <p
            className="
              mt-3
              text-sm
              text-gray-600
            "
          >
            {paymentScreenshot.name}
          </p>
        )}

        <button
          onClick={handleOrder}
          className="
            bg-orange-500
            text-white
            px-5
            py-4
            rounded-2xl
            w-full
            mt-6
            font-bold
            text-lg
            hover:bg-orange-600
            transition
          "
        >
          Place Order
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
