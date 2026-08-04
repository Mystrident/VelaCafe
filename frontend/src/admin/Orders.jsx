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
    const handleNewOrder = () => fetchOrders();
    window.addEventListener("admin-new-order", handleNewOrder);
    return () => {
      clearInterval(interval);
      window.removeEventListener("admin-new-order", handleNewOrder);
    };
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
      case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Preparing": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Ready": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // 🔴 NEW LOGIC: Group orders by Date
  const groupedOrders = orders.reduce((acc, order) => {
    // Fallback to today's date if createdAt is missing for some reason
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const dateKey = orderDate.toISOString().split('T')[0]; // Creates a "YYYY-MM-DD" string
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(order);
    return acc;
  }, {});

  // Sort the dates from Newest to Oldest
  const sortedDates = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#3a1710] tracking-tight">Live Orders</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage and update kitchen tickets.</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 w-fit">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-bold text-[#3a1710]">Live Sync Active</span>
          </div>
        </div>

        {/* 🔴 NEW UI: Render orders grouped by Date */}
        <div className="space-y-16">
          {sortedDates.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-5xl mb-4 block">🍳</span>
              <h2 className="text-2xl font-black text-[#3a1710]">No Orders Yet</h2>
              <p className="text-gray-500 font-medium mt-2">Waiting for new orders to come in...</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => {
              const displayDate = new Date(dateKey).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              const dayOrders = groupedOrders[dateKey];
              const dayTotal = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={dateKey} 
                  className="animate-fade-in"
                >
                  {/* Date Header Segment */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b-2 border-gray-200/60">
                    <h2 className="text-2xl md:text-3xl font-black text-[#3a1710] tracking-tight flex items-center gap-3">
                      <span className="bg-orange-100 text-orange-600 p-2.5 rounded-2xl text-xl">📅</span>
                      {displayDate}
                    </h2>
                    
                    <div className="mt-4 md:mt-0 font-bold text-sm flex gap-3">
                      <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl border border-gray-200">
                        {dayOrders.length} {dayOrders.length === 1 ? 'Order' : 'Orders'}
                      </span>
                      <span className="bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-200 shadow-sm">
                        Revenue: ₹{dayTotal}
                      </span>
                    </div>
                  </div>

                  {/* Grid of Orders for this specific Date */}
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                    <AnimatePresence>
                      {dayOrders.map((order) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={order._id}
                          className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h2 className="text-3xl md:text-4xl font-black text-orange-500 mb-1">
                                #{String(order.orderNumber).padStart(3, "0")}
                              </h2>
                              <h3 className="text-xl font-bold text-[#3a1710]">{order.userName}</h3>
                              <p className="text-sm font-medium text-gray-400 mt-1 flex items-center gap-2">
                                <span>Pickup: <strong className="text-gray-600">{order.pickupTime}</strong></span>
                                •
                                <span>Ordered: {order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A"}</span>
                              </p>
                            </div>

                            <div className="text-right flex flex-col items-end">
                              <span className={`px-4 py-1.5 rounded-xl font-bold text-sm border ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <p className="font-black text-[#3a1710] mt-3 text-2xl md:text-3xl">
                                ₹{order.totalAmount}
                              </p>
                            </div>
                          </div>

                          {/* Replace this specific block inside your Orders.jsx */}
                          <div className="bg-gray-50 rounded-2xl p-5 flex-grow border border-gray-100 max-h-64 overflow-y-auto custom-scrollbar mb-2">
                             <h3 className="font-bold text-[#3a1710] text-sm uppercase tracking-wider mb-3 sticky top-0 bg-gray-50 pb-2 z-10">
                              Order Details
                              </h3>
                            <div className="space-y-4 pb-4">
                              {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-[#3a1710] font-medium">
                                <p className="flex items-center gap-3">
                                <span className="bg-white border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                {item.quantity}
                                </span>
                                <span>{item.name}</span>
                                </p>
                              </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 md:gap-3 mt-6 pt-6 border-t border-gray-100 overflow-x-auto hide-scrollbar pb-2">
                            <button
                              onClick={() => updateStatus(order._id, "Preparing")}
                              className={`flex-1 py-3 px-2 md:px-4 rounded-xl font-bold transition-colors text-sm md:text-base shrink-0 min-w-[100px] ${
                                order.status === "Preparing" 
                                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                                  : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                              }`}
                            >
                              Preparing
                            </button>

                            <button
                              onClick={() => updateStatus(order._id, "Ready")}
                              className={`flex-1 py-3 px-2 md:px-4 rounded-xl font-bold transition-colors text-sm md:text-base shrink-0 min-w-[100px] ${
                                order.status === "Ready" 
                                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" 
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              }`}
                            >
                              Ready
                            </button>

                            <button
                              onClick={() => updateStatus(order._id, "Completed")}
                              className={`flex-1 py-3 px-2 md:px-4 rounded-xl font-bold transition-colors text-sm md:text-base shrink-0 min-w-[100px] ${
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
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
