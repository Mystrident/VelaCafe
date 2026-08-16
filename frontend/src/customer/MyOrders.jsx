import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

const PAGE_SIZE = 20;

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function MyOrders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      const customerToken = localStorage.getItem("customerToken");
      if (!customerToken) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await api.get(
          `/api/orders/customer/history?page=${page}&limit=${PAGE_SIZE}`,
          { headers: { Authorization: `Bearer ${customerToken}` } },
        );
        setData(response.data);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("activeOrders");
          window.dispatchEvent(new Event("customer-auth-changed"));
          navigate("/", { replace: true });
          return;
        }
        setError(requestError.response?.data?.message || "We couldn't load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate, page, retryCount]);

  return (
    <div className="min-h-screen bg-cafe-bg text-cafe-text pb-20">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 md:px-10 pt-32">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-cafe-muted hover:text-orange-500 transition-colors">
          <HiArrowLeft className="text-lg" /> Back to menu
        </Link>
        <div className="mt-6 mb-10">
          <p className="text-orange-500 text-xs font-black tracking-[0.22em] uppercase">Account</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight">My Orders</h1>
          <p className="mt-3 text-cafe-muted font-medium">Your complete Velaa Cafe order history.</p>
        </div>

        {loading ? <Loader /> : error ? (
          <div className="rounded-[2rem] border border-cafe-border bg-cafe-surface p-8 text-center">
            <p className="font-bold text-cafe-text">{error}</p>
            <button onClick={() => setRetryCount((current) => current + 1)} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">Try again</button>
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="rounded-[2rem] border border-cafe-border bg-cafe-surface p-12 text-center">
            <span className="text-5xl">☕</span>
            <h2 className="mt-4 text-2xl font-black">No orders yet</h2>
            <p className="mt-2 text-cafe-muted">Your paid Velaa Cafe orders will appear here.</p>
            <Link to="/" className="inline-block mt-6 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600">Browse menu</Link>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {data.orders.map((order) => (
                <article key={order._id} className="rounded-[2rem] border border-cafe-border bg-cafe-surface p-5 md:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted">{formatDate(order.orderDate)}</p>
                      <h2 className="mt-1 text-3xl font-black text-orange-500">#{String(order.orderNumber).padStart(3, "0")}</h2>
                      <p className="mt-1 font-semibold text-cafe-muted">Pickup at <span className="text-cafe-text">{order.pickupTime}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <span className="rounded-xl border border-cafe-border bg-cafe-elevated px-3 py-1.5 text-sm font-bold text-cafe-text">{order.status}</span>
                      <span className={`rounded-xl px-3 py-1.5 text-sm font-bold ${order.paymentStatus === "REFUND_REQUIRED" ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300" : "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300"}`}>{order.paymentStatus === "REFUND_REQUIRED" ? "Refund required" : "Paid"}</span>
                    </div>
                  </div>
                  <div className="mt-6 border-t border-cafe-border pt-5 space-y-3">
                    {order.items.map((item, index) => (
                      <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-4 text-sm">
                        <span className="font-semibold text-cafe-text"><span className="mr-2 inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-cafe-elevated px-1 text-xs text-cafe-muted">{item.quantity}×</span>{item.name}</span>
                        <span className="font-bold text-cafe-muted">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-end border-t border-cafe-border pt-5"><span className="text-xl font-black text-cafe-text">Total <span className="ml-2 text-orange-500">₹{order.totalAmount}</span></span></div>
                </article>
              ))}
            </div>
            {data.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Order history pagination">
                <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-xl border border-cafe-border bg-cafe-surface p-3 text-cafe-text disabled:cursor-not-allowed disabled:opacity-40"><HiChevronLeft /></button>
                <span className="text-sm font-bold text-cafe-muted">Page {data.page} of {data.totalPages}</span>
                <button disabled={page === data.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-xl border border-cafe-border bg-cafe-surface p-3 text-cafe-text disabled:cursor-not-allowed disabled:opacity-40"><HiChevronRight /></button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyOrders;
