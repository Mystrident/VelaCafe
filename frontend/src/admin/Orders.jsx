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

  const markCompleted = async (id) => {
    try {
      await api.patch(`/orders/${id}`, {
        status: "Completed",
      });

      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <AdminNavbar />

      <div>
        <h1>ALL ORDERS</h1>

        {orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              margin: "15px",
            }}
          >
            <h2>{order.customerName}</h2>

            <p>Department: {order.department}</p>

            <p>Pickup: {order.pickupTime}</p>

            <p>Total: ₹{order.totalAmount}</p>

            <p>Status: {order.status}</p>

            <h3>Items:</h3>

            {order.items.map((item, index) => (
              <div key={index}>
                <p>
                  {item.name} × {item.quantity}
                </p>
              </div>
            ))}

            <img src={order.paymentScreenshot} alt="payment" width="200" />

            <br />
            <br />

            {order.status !== "Completed" && (
              <button onClick={() => markCompleted(order._id)}>
                Mark Completed
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default Orders;
