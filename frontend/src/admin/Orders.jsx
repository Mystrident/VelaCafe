import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import AdminNavbar from "../components/AdminNavbar";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}`, { status });
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Preparing": return "bg-orange-100 text-orange-700";
      case "Ready": return "bg-blue-100 text-blue-700";
      case "Completed": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#3a1710] tracking-tight">Live Orders</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage and update kitchen tickets.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-bold text-[#3a1710]">Live Sync</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 grid-cols-1 lg:grid-cols-2"
        >
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={order._id}
                className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-black text-orange-500 mb-1">
                      #{String(order.orderNumber).padStart(3, "0")}
                    </h2>
                    <h3 className="text-xl font-bold text-[#3a1710]">{order.userName}</h3>
                    <p className="text-sm font-medium text-gray-400 mt-1">Pickup: {order.pickupTime}</p>
                  </div>

                  <div className="text-right">
                    <span className={`px-4 py-2 rounded-xl font-bold text-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="font-black text-[#3a1710] mt-3 text-2xl">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 flex-grow border border-gray-100">
                  <h3 className="font-bold text-[#3a1710] text-sm uppercase tracking-wider mb-3">Order Details</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-[#3a1710] font-medium">
                        <p className="flex items-center gap-3">
                          <span className="bg-white border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                            {item.quantity}
                          </span>
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 overflow-x-auto pb-2">
                  <button
                    onClick={() => updateStatus(order._id, "Preparing")}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                      order.status === "Preparing" 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    }`}
                  >
                    Preparing
                  </button>

                  <button
                    onClick={() => updateStatus(order._id, "Ready")}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                      order.status === "Ready" 
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    Ready
                  </button>

                  <button
                    onClick={() => updateStatus(order._id, "Completed")}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                      order.status === "Completed" 
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

export default Orders;