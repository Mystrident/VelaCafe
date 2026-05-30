import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function StatusModal({
  orderId,
  orderNumber,
  initialStatus = "Pending",
  onClose,
}) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(import.meta.env.VITE_API_URL.replace("/api", ""));

    socket.emit("join-order", orderId);

    socket.on("order-status-updated", (data) => {
      if (data.orderId === orderId) {
        setStatus(data.status);

        localStorage.setItem(
          "activeOrder",
          JSON.stringify({
            orderId,
            orderNumber,
            status: data.status,
          }),
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, orderNumber]);

  const getStatusColor = () => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Preparing":
        return "bg-orange-100 text-orange-700";

      case "Ready":
        return "bg-blue-100 text-blue-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      className="
        fixed
        bottom-5
        right-5
        bg-white
        rounded-3xl
        shadow-2xl
        p-6
        w-[350px]
        z-50
        border
      "
    >
      <div className="flex justify-between items-center">
        <h2
          className="
            text-2xl
            font-black
            text-[#4b1e14]
          "
        >
          Order #{String(orderNumber).padStart(3, "0")}
        </h2>

        {status === "Completed" && (
          <button
            onClick={onClose}
            className="
      text-gray-400
      hover:text-black
    "
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-5">
        <p
          className="
            text-gray-500
            text-sm
          "
        >
          Current Status
        </p>

        <div
          className={`
            mt-2
            px-4
            py-3
            rounded-2xl
            font-bold
            text-center
            ${getStatusColor()}
          `}
        >
          {status}
        </div>
      </div>

      {status === "Ready" && (
        <div
          className="
            mt-4
            bg-green-50
            border
            border-green-200
            rounded-2xl
            p-3
            text-green-700
            text-sm
          "
        >
          Your order is ready for pickup.
        </div>
      )}

      {status === "Completed" && (
        <div
          className="
            mt-4
            bg-blue-50
            border
            border-blue-200
            rounded-2xl
            p-3
            text-blue-700
            text-sm
          "
        >
          Order completed successfully.
        </div>
      )}
    </div>
  );
}

export default StatusModal;
