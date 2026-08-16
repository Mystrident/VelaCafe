import { useEffect, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import api from "../api/axios";
import AdminNavbar from "../components/AdminNavbar";
import Loader from "../components/Loader";

const PAGE_SIZE = 20;

const formatOrderDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getOrderStatusColor = (status) => {
  switch (status) {
    case "Pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Preparing": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Ready": return "bg-blue-100 text-blue-700 border-blue-200";
    case "Completed": return "bg-green-100 text-green-700 border-green-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

function PreviousOrders() {
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/api/orders/history?page=${page}&limit=${PAGE_SIZE}`);
        setHistory(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Couldn't load order history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [page, retryCount]);

  return (
    <div className="bg-[#fdfbf7] min-h-screen pb-20">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#3a1710] tracking-tight">Previous Orders</h1>
            <p className="text-gray-500 mt-2 font-medium">Browse every recorded order, including today.</p>
          </div>
          {history && <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm text-sm font-bold text-[#3a1710]">{history.total} {history.total === 1 ? "order" : "orders"} recorded</div>}
        </div>

        {loading ? <Loader /> : error ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-10 text-center">
            <p className="font-bold text-[#3a1710]">{error}</p>
            <button onClick={() => setRetryCount((current) => current + 1)} className="mt-5 bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Try Again</button>
          </div>
        ) : history?.orders.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">Order history</span>
            <h2 className="text-2xl font-black text-[#3a1710]">No Previous Orders</h2>
            <p className="text-gray-500 font-medium mt-2">Order history will appear here once customers begin ordering.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {history.orders.map((order) => (
                <article key={order._id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 flex flex-col">
                  <div className="flex justify-between gap-4 items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{formatOrderDate(order.orderDate)}</p>
                      <h2 className="text-3xl md:text-4xl font-black text-orange-500 mt-1">#{String(order.orderNumber).padStart(3, "0")}</h2>
                      <h3 className="text-xl font-bold text-[#3a1710] mt-2">{order.userName}</h3>
                      <p className="text-sm text-gray-500 mt-1 break-all">{order.userEmail}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className={`px-3 py-1.5 rounded-xl font-bold text-sm border ${getOrderStatusColor(order.status)}`}>{order.status}</span>
                      <span className={`px-3 py-1.5 rounded-xl font-bold text-sm ${order.paymentStatus === "REFUND_REQUIRED" ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{order.paymentStatus === "REFUND_REQUIRED" ? "Refund Required" : order.paymentStatus}</span>
                    </div>
                  </div>

                  <p className="mt-5 text-sm font-medium text-gray-500">Pickup: <span className="font-bold text-gray-700">{order.pickupTime}</span></p>
                  <div className="mt-5 bg-gray-50 rounded-2xl p-5 border border-gray-100 flex-grow">
                    <h4 className="font-bold text-[#3a1710] text-xs uppercase tracking-wider mb-3">Order Details</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={`${order._id}-${index}`} className="flex justify-between items-center gap-4 text-[#3a1710] font-medium">
                          <span className="flex items-center gap-3"><span className="bg-white border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">{item.quantity}</span>{item.name}</span>
                          <span className="text-sm text-gray-500 shrink-0">Rs. {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center"><span className="text-sm font-bold uppercase tracking-wider text-gray-400">Total</span><span className="text-2xl font-black text-[#3a1710]">Rs. {order.totalAmount}</span></div>
                </article>
              ))}
            </div>

            {history.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Previous orders pagination">
                <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="p-3 rounded-xl border border-gray-200 bg-white text-[#3a1710] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"><HiChevronLeft className="text-xl" /></button>
                <span className="text-sm font-bold text-gray-500">Page {history.page} of {history.totalPages}</span>
                <button disabled={page === history.totalPages} onClick={() => setPage((current) => current + 1)} className="p-3 rounded-xl border border-gray-200 bg-white text-[#3a1710] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"><HiChevronRight className="text-xl" /></button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default PreviousOrders;
