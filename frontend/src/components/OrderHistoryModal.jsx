import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import Loader from "./Loader";

function OrderHistoryModal({ closeModal }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem("customerToken");
      if (!token) return;

      // Note: Make sure you create this route in your backend!
      const res = await api.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Preparing": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Ready": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
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
        className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 border border-gray-100 max-h-[85vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-[#3a1710] tracking-tight">Recent Orders</h1>
          <button onClick={closeModal} className="text-gray-400 hover:text-red-500 font-bold transition-colors">✕</button>
        </div>

        <div className="overflow-y-auto flex-grow custom-scrollbar pr-2 space-y-4">
          {loading ? (
            <Loader />
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium">
              <span className="text-4xl block mb-2">🍽️</span>
              No recent orders found in the last 24 hours.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order #{String(order.orderNumber).padStart(3, '0')}</span>
                    <h3 className="font-black text-[#3a1710] text-lg">₹{order.totalAmount}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-sm font-medium text-gray-600 flex justify-between">
                      <span>{item.name} <span className="text-orange-500 font-bold ml-1">x{item.quantity}</span></span>
                    </p>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default OrderHistoryModal;