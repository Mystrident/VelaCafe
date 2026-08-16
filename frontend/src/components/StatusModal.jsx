import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

function StatusModal({
  orderId,
  orderNumber,
  initialStatus = "Pending",
  initialItems = [],
  onStatusChange,
  onClose,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [items, setItems] = useState(initialItems);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // The socket below only reports status CHANGES that happen while it's
    // connected — it has no memory of anything that fired before this
    // component mounted (or while it was briefly disconnected). Without
    // this, an order marked "Ready"/"Completed" while the tracker wasn't
    // actively listening (page refresh, dropped wifi, tab opened late)
    // would stay stuck showing the old cached status forever. Pulling the
    // real status directly fixes that, both on first mount and again any
    // time the socket (re)connects.
    const syncStatus = async () => {
      try {
        const customerToken = localStorage.getItem("customerToken");
        if (!customerToken) return;

        const res = await api.get(`/api/orders/customer/${orderId}/status`, {
          headers: { Authorization: `Bearer ${customerToken}` },
        });

        // Idempotent either way, so just always report the confirmed
        // server status rather than tracking whether it "changed".
        
        setStatus(res.data.status);
        setItems(res.data.items);
        onStatusChange?.(res.data.status);
      } catch (error) {
        // Non-fatal: fall back to whatever the socket reports live, or
        // the cached status this component was initialized with.
        console.log("Couldn't sync order status:", error);
      }
    };

    syncStatus();

    const customerToken = localStorage.getItem("customerToken");
    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
      auth: { token: customerToken },
    });

    // Fires on the initial connection AND every reconnect, so a dropped
    // connection that comes back doesn't leave the room-join or the
    // status stale.
    socket.on("connect", () => {
      socket.emit("join-order", orderId);
      syncStatus();
    });

    socket.on("order-status-updated", (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status);
        // Automatically pop the modal open when a status update arrives
        setIsExpanded(true);
        onStatusChange?.(data.status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, orderNumber]);

  const getStatusColor = () => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "Preparing":
        return "bg-orange-50 text-orange-600 border-orange-200";
      case "Ready":
        return "bg-green-50 text-green-600 border-green-200";
      case "Completed":
        return "bg-gray-50 text-gray-600 border-gray-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const handleCloseClick = () => {
    if (status === "Completed") {
      onClose(); // Completely dismiss and clear local storage via Home.jsx
    } else {
      setIsExpanded(false); // Minimize to circle if not completed
    }
  };

  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          key="expanded-card"
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="
            bg-cafe-surface/95
            backdrop-blur-md
            rounded-[2rem]
            shadow-[0_20px_50px_rgb(0,0,0,0.15)]
            p-6
            w-[340px]
            border
            border-cafe-border
          "
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs font-bold text-cafe-muted uppercase tracking-widest mb-1">
                Live Tracking
              </p>
              <h2 className="text-2xl font-black text-cafe-text">
                Order #{String(orderNumber).padStart(3, "0")}
              </h2>
            </div>

            <button
              onClick={handleCloseClick}
              className="w-8 h-8 rounded-full bg-cafe-elevated flex items-center justify-center text-cafe-muted hover:bg-cafe-border transition-colors font-bold"
              title={
                status === "Completed" ? "Close Order" : "Minimize Tracker"
              }
            >
              ✕
            </button>
          </div>

 <div className="mb-4">
  <div className="bg-cafe-elevated border border-cafe-border rounded-2xl p-4">
    <p className="text-xs font-bold uppercase tracking-widest text-cafe-muted mb-3">
      Order Items
    </p>

    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-cafe-surface rounded-xl px-4 py-3 shadow-sm"
        >
          <span className="font-semibold text-cafe-text">
            {item.name}
          </span>

          <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full">
            × {item.quantity}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

          <div
            className={`
              flex items-center justify-center gap-3
              px-4
              py-4
              rounded-2xl
              font-bold
              border
              ${getStatusColor()}
            `}
          >
            {status !== "Completed" && status !== "Ready" && (
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
            )}
            {status}
          </div>

          {status === "Ready" && (
            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-green-600">
                Your food is hot and ready!
              </p>
              <p className="text-xs text-cafe-muted mt-1">
                Please pick it up at the counter.
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.button
          key="minimized-circle"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => setIsExpanded(true)}
          className="
            relative
            w-16
            h-16
            bg-cafe-surface
            rounded-full
            shadow-[0_10px_30px_rgb(0,0,0,0.15)]
            border-2
            border-orange-500
            flex
            items-center
            justify-center
            group
            hover:scale-105
            transition-transform
          "
        >
          <span className="text-2xl group-hover:animate-bounce">🍔</span>
          {/* Active Pulse Indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-white"></span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default StatusModal;
