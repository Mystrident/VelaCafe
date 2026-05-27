import { useEffect, useState } from "react";

import api from "../api/axios";

import AdminNavbar from "../components/AdminNavbar";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");

      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}`, {
        status,
      });

      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-10 text-[#4b1e14]">ALL ORDERS</h1>

        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#4b1e14]">
                    {order.customerName}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    Department: {order.department}
                  </p>

                  <p className="text-gray-600">Pickup: {order.pickupTime}</p>

                  <p className="text-gray-600">
                    Payment: {order.paymentStatus}
                  </p>

                  <p className="font-bold text-orange-500 mt-2 text-xl">
                    ₹{order.totalAmount}
                  </p>
                </div>

                <div>
                  <span
                    className="
                      px-4
                      py-2
                      rounded-full
                      bg-orange-100
                      text-orange-600
                      font-bold
                    "
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-lg mb-3">Ordered Items</h3>

                <div className="grid gap-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <p>
                        {item.name} × {item.quantity}
                      </p>

                      <p>₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6 flex-wrap">
                <button
                  onClick={() => updateStatus(order._id, "Preparing")}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-xl"
                >
                  Preparing
                </button>

                <button
                  onClick={() => updateStatus(order._id, "Ready")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                >
                  Ready
                </button>

                <button
                  onClick={() => updateStatus(order._id, "Completed")}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Orders;
